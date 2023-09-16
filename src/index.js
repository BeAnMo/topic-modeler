// @ts-check
const {
  BowVector,
  SORT_KEY,
  FREQ_KEY,
  defaultCompare,
} = require('./x-types/vector.js');
const { xSet } = require('./x-types/set.js');

function makeVectEl(sortVal, freqVal) {
  return {
    [SORT_KEY]: sortVal,
    [FREQ_KEY]: freqVal,
  };
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

class Model {
  constructor() {
    this.bow = new BowVectorTrie();
    this.allTerms = new xSet();

    this.allTermsVect = [];
  }

  add(doc, word, freq) {
    this.bow.add(doc, word, freq);
    this.allTerms.add(word);
    return this;
  }

  generateTopics(numTopics) {
    this.allTermsVect = [...this.allTerms].map((term) => makeVectEl(term, 0));
    /**
     * @typedef {[string, BowVector]} BowPair
     *
     * @type {BowPair[]}
     */
    const allDocs = [...this.bow.all()];
    const len = allDocs.length;

    const makeVect = memo(fullBowVector);

    /**
     *
     * @param {BowPair} param0
     * @returns {BowVector}
     */
    const docVect = ([_, vec]) => vec;
    /**
     *
     * @param {BowPair} param0
     * @returns {string}
     */
    const docName = ([d]) => d;

    let results = [];

    for (let i = 0; i < len; i++) {
      const vectA = makeVect(
        defaultCompare,
        this.allTermsVect,
        docVect(allDocs[i])
      );
      for (let j = i + 1; j < len; j++) {
        const vectB = makeVect(
          defaultCompare,
          this.allTermsVect,
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

module.exports = {
  BowVectorTrie,
};
