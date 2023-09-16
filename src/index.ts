import {
  BowVector,
  SORT_KEY,
  FREQ_KEY,
  defaultCompare,
  BowVectorElem,
  BowVectorVal,
  BowVectorFreq,
} from './x-types/vector';
import { xSet } from './x-types/set';
const { BasicTrie } = require('a-trie-grows-in-js');

function makeVectEl(
  sortVal: BowVectorVal,
  freqVal: BowVectorFreq
): BowVectorElem {
  return {
    [SORT_KEY]: sortVal,
    [FREQ_KEY]: freqVal,
  };
}

function fullBowVector(
  cmp: (a: BowVectorElem, b: BowVectorElem) => number,
  allTermsVect: BowVector,
  docVect: BowVector
): BowVector {
  const _allTermsVect = allTermsVect.toArray();
  let i = 0;
  const _docVect = docVect.toArray();
  let j = 0;
  let results = [];

  while (docVect[j] !== undefined) {
    const firstAll = _allTermsVect[i];
    const firstDoc = _docVect[j];
    const cmped = cmp(firstAll, firstDoc);

    if (cmped < 0) {
      results.push(firstAll);
      i++;
    } else if (cmped > 0) {
      results.push(firstDoc);
      j++;
    } else {
      results.push(firstDoc);
      i++;
      j++;
    }
  }

  if (i < _allTermsVect.length - 1) {
    results.push(..._allTermsVect.slice(i));
  }
  return new BowVector(results);
}

class BowVectorTrie extends BasicTrie {
  constructor() {
    super();
    // Count of unique full keys.
    this.branches = 0;
    // Count of all vector elements.
    this.leaves = 0;
  }

  add(
    key: BowVectorVal,
    val: BowVectorVal,
    freq: BowVectorFreq = 0
  ): BowVectorTrie {
    const cursor = this._cursor(key, 1, 0);

    if (!cursor[this.EOI]) {
      cursor[this.EOI] = new BowVector(
        [{ [SORT_KEY]: val, [FREQ_KEY]: freq }],
        true
      );
      this.branches++;
      this.leaves++;
    } else {
      const newEntry = cursor[this.EOI].push(val, freq) === -1;

      if (newEntry) {
        this.leaves++;
      }
    }
    return this;
  }

  delete(word: BowVectorVal): BowVectorTrie {
    let [cursor, parent] = this._cursor(word, 0, 1);

    if (cursor !== this.NONE) {
      const vectorLen = cursor[this.EOI].length;
      delete parent[word.slice(-1)[0]];
      this.branches--;
      this.leaves -= vectorLen;
    }

    return this;
  }

  *[Symbol.iterator](): Generator<[BowVectorVal, BowVector], any, unknown> {
    for (const [doc, vector] of this._traverse()) {
      yield [doc, vector];
    }
  }
}

function memo(proc) {
  let cache = new Map();
  return function _memo(...args) {
    if (cache.has(args)) {
      return cache.get(args);
    }
    const result = proc.apply(this, args);
    cache.set(args, result);
    return cache;
  };
}

export class Model {
  bow: BowVectorTrie;
  allTerms: xSet<BowVectorVal>;
  emptyBag: BowVector;

  constructor() {
    this.bow = new BowVectorTrie();
    this.allTerms = new xSet<BowVectorVal>();
    this.emptyBag = new BowVector();
  }

  add(doc: BowVectorVal, word: BowVectorVal, freq: BowVectorFreq): Model {
    this.bow.add(doc, word, freq);
    this.allTerms.add(word);
    return this;
  }

  generateTopics(numTopics) {
    this.emptyBag = new BowVector(
      [...this.allTerms].map((term) => makeVectEl(term, 0))
    );

    const allDocs: [BowVectorVal, BowVector][] = [...this.bow];
    const len = allDocs.length;

    const makeDocBowWithAllWords = memo(fullBowVector);
    const docVect = ([_, vec]: [BowVectorVal, BowVector]): BowVector => vec;
    const docName = ([d]: [BowVectorVal, BowVector]): BowVectorVal => d;

    let results: [BowVectorVal, BowVectorVal, number][] = [];

    for (let i = 0; i < len; i++) {
      const vectA = makeDocBowWithAllWords(
        defaultCompare,
        this.emptyBag,
        docVect(allDocs[i])
      );
      for (let j = i + 1; j < len; j++) {
        const vectB = makeDocBowWithAllWords(
          defaultCompare,
          this.emptyBag,
          docVect(allDocs[j])
        );

        results.push([
          docName(allDocs[i]),
          docName(allDocs[j]),
          vectA.similarity(vectB),
        ]);
      }
    }
    return results;
  }
}
