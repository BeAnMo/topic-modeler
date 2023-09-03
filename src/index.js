// @ts-check
const { BasicTrie } = require('a-trie-grows-in-js');
const { BagOfWordsVector, SORT_KEY, FREQ_KEY } = require('./x-types/vector.js');

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
}

function* skipUntil(pred, iter) {
  for (const item of iter) {
    if (pred(item)) {
      yield item;
      break;
    }
  }
  yield* iter;
}

function* modelTopics(bowVecTrie) {
  for (const [vectA, wordA] of bowVecTrie._traverse()) {
    const wordMatch = ([wordX]) => wordA === wordX;
    for (const [vectB, wordB] of skipUntil(wordMatch, bowVecTrie._traverse())) {
      yield [wordA, wordB, vectA.similarity(vectB)];
    }
  }
}

module.exports = {
  modelTopics,
  BowVectorTrie,
};
