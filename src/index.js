// @ts-check
const { BasicTrie } = require('a-trie-grows-in-js');
const { BagOfWordsVector, SORT_KEY, FREQ_KEY, defaultCompare } = require('./x-types/vector.js');
const { xSet } = require('./x-types/set.js');

function makeVectEl(sortVal, freqVal) {
  return {
    [SORT_KEY]: sortVal,
    [FREQ_KEY]: freqVal
  };
}

class TermToDocLookup extends BasicTrie {
  constructor() {
    super();
  }

  /**
   * 
   * @param {string} term 
   * @param {string} doc 
   * @returns {TermToDocLookup}
   */
  add(term, doc) {
    /**
     * @type {{ [key: string]: xSet }}
     */
    const cursor = this._cursor(term, 1, 0);

    if (!cursor[this.EOI]) {
      cursor[this.EOI] = new xSet([doc]);
      this.size++;
    } else {
      cursor[this.EOI].add(doc);
    }

    return this;
  }

  *[Symbol.iterator]() {
    for (const [word, docIds] of this._traverse()) {
      yield [word, docIds];
    }
  }
}

function fullBowVector(cmp, allTermsVect, docVect) {
  let i = 0;
  let j = 0;
  let results = [];

  while (docVect[j] !== undefined) {
    const firstAll = allTermsVect[i];
    const firstDoc = docVect[j];
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

  if (i < allTermsVect.length - 1) {
    results.push(...allTermsVect.slice(i));
  }
  return results;
}

class BowVectorTrie extends BasicTrie {
  constructor() {
    super();
    // Count of unique full keys.
    this.branches = 0;
    // Count of all vector elements.
    this.leaves = 0;
  }

  /**
   *
   * @param {string} key
   * @param {string} val
   * @param {number} freq
   * @returns {BowVectorTrie}
   */
  add(key, val, freq = 0) {
    const cursor = this._cursor(key, 1, 0);

    if (!cursor[this.EOI]) {
      cursor[this.EOI] = new BagOfWordsVector(
        [{ [SORT_KEY]: val, [FREQ_KEY]: freq }],
        1
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

  /**
   *
   * @param {string} word
   * @returns {BowVectorTrie}
   */
  delete(word) {
    let [cursor, parent] = this._cursor(word, 0, 1);

    if (cursor !== this.NONE) {
      const vectorLen = cursor[this.EOI].length;
      delete parent[word.slice(-1)[0]];
      this.branches--;
      this.leaves -= vectorLen;
    }

    return this;
  }

  *[Symbol.iterator]() {
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
  }
}

class Model {
  constructor() {
    this.bow = new BowVectorTrie();
    this.docLookup = new TermToDocLookup();

    this.allTermsVect = [];
  }

  add(doc, word, freq) {
    this.bow.add(doc, word, freq);
    this.docLookup.add(word, doc);
    return this;
  }

  generateTopics(numTopics) {
    this.allTermsVect = [...this.docLookup]
      .map(([term]) => makeVectEl(term, 0))
      .sort((a, b) => a[SORT_KEY].localeCompare(b[SORT_KEY]));
    /**
     * @type {[string, BagOfWordsVector][]}
     */
    const allDocs = [...this.bow];
    const len = allDocs.length;

    const makeVect = memo(fullBowVector);

    const docVect = ([doc, vec]) => vec;
    const docName = ([d]) => d;

    let results = [];

    for (let i = 0; i < len; i++) {
      const vectA = makeVect(fullBowVector, this.allTermsVect, docVect(allDocs[i]));
      for (let j = i + 1; j < len; j++) {
        const vectB = makeVect(fullBowVector, this.allTermsVect, docVect(allDocs[j]));

        results.push([
          docName(allDocs[i]),
          docName(allDocs[j]),
          vectA.similarity(vectB)
        ]);
      }
    }
    return results;
  }
}

module.exports = {
  BowVectorTrie,
};
