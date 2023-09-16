const { findIndex, findPossibleIndex } = require('arrset/dist/flexible.js');

class BowVector {
  static SORT_KEY = 'w'; // word
  static FREQ_KEY = 'f'; // freq
  static defaultCompare = function defaultCompare(a, b) {
    return a[BowVector.SORT_KEY].localeCompare(b[BowVector.SORT_KEY]);
  };
  static defaultFind = function defaultFind(word) {
    return function boundDefaultFind(b) {
      return word.localeCompare(b[BowVector.SORT_KEY])
    }
  };
  static makeVectElem = function makeVectElem(w, f) {
    return {
      [BowVector.SORT_KEY]: w,
      [BowVector.FREQ_KEY]: f,
    };
  };

  constructor(items, ignorePrep) {
    if (!Array.isArray(items)) {
      this._v = [];
    } else if (ignorePrep) {
      this._v = items;
    } else {
      this._v = items.sort(BowVector.defaultCompare);
    }
  }

  get length() {
    return this._v.length;
  }

  toArray() {
    return this._v;
  }

  /**
   * @description Adds a WORD to the current
   * BowVector. Returns the existing
   * index if WORD exists or -1 denoting a
   * a new word.
   * @param {string} word
   * @param {number} freq
   * @returns
   */
  push(word, freq) {
    const find = BowVector.defaultFind(word);
    const existingIdx = findIndex(find, this._v);
    console.log(word, freq)
    if (existingIdx > -1) {
      this._v[existingIdx][BowVector.FREQ_KEY] += freq;
    } else {
      const newIdx = findPossibleIndex(find, this._v);
      this._v.splice(newIdx, 0, BowVector.makeVectElem(word, freq));
    }
    return existingIdx;
  }

  delete(word) {
    const find = BowVector.defaultFind(word);
    const idx = findIndex(find, this._v);
    if (idx > -1) {
      this._v.splice(idx, 1);
    }

    return this;
  }

  get(word) {
    const FREQ_KEY = BowVector.FREQ_KEY;
    const find = BowVector.defaultFind(word);
    const idx = findIndex(find, this._v);

    if (idx === -1) {
      return undefined;
    }

    return this._v[idx]?.[FREQ_KEY];
  }

  _swap(that, noThis, noThat) {
    const aLen = this._v.length;
    if (!aLen) {
      return [null, noThis];
    }
    const bLen = that._v.length;
    if (!bLen) {
      return [null, noThat];
    }

    if (aLen > bLen) {
      return [that._v, this._v];
    }
    return [this._v, that._v];
  }

  _join(combine, sm, lg) {
    const SORT_KEY = BowVector.SORT_KEY;
    const FREQ_KEY = BowVector.FREQ_KEY;

    let results = [];
    let i = 0;
    let j = 0;

    while (sm[i] && lg[j]) {
      const a = sm[i];
      const b = lg[j];

      if (a[SORT_KEY] < b[SORT_KEY]) {
        results.push(a);
        i++;
      } else if (a[SORT_KEY] > b[SORT_KEY]) {
        results.push(b);
        j++;
      } else {
        results.push({
          [SORT_KEY]: a[SORT_KEY],
          [FREQ_KEY]: combine(a[FREQ_KEY], b[FREQ_KEY]),
        });
        i++;
        j++;
      }
    }

    if (sm[i]) {
      for (; i < sm.length; i++) {
        results.push(sm[i]);
      }
    }

    if (lg[j]) {
      for (; j < lg.length; j++) {
        results.push(lg[j]);
      }
    }

    return results;
  }

  add(that) {
    const [sm, lg] = this._swap(that, that._v, this._v);
    if (sm === null) {
      return lg;
    }
    const res = this._join((a, b) => a + b, sm, lg);
    return new BowVector(res, true);
  }

  subtract(that) {
    const [sm, lg] = this._swap(that, that._v, this._v);
    if (sm === null) {
      return lg;
    }
    const res = this._join((a, b) => a - b, sm, lg);
    return new BowVector(res, true);
  }

  _similarity(sm, lg) {
    let i = 0;
    let j = 0;

    let v1mag = 0;
    let v2mag = 0;
    let dotProd = 0;

    while (sm[i] && lg[j]) {
      const a = sm[i];
      const b = lg[j];

      if (a[BowVector.SORT_KEY] < b[BowVector.SORT_KEY]) {
        // Equivalent of b.freq == 0
        v1mag += a[BowVector.FREQ_KEY] ** 2;
        i++;
      } else if (a[BowVector.SORT_KEY] > b[BowVector.SORT_KEY]) {
        // Equivalent of a.freq == 0
        v2mag += b[BowVector.FREQ_KEY] ** 2;
        j++;
      } else {
        v1mag += a[BowVector.FREQ_KEY] ** 2;
        v2mag += b[BowVector.FREQ_KEY] ** 2;
        dotProd += a[BowVector.FREQ_KEY] * b[BowVector.FREQ_KEY];
        i++;
        j++;
      }
    }

    if (sm[i]) {
      for (; i < sm.length; i++) {
        v1mag += sm[i][BowVector.FREQ_KEY] ** 2;
      }
    }

    if (lg[j]) {
      for (; j < lg.length; j++) {
        v2mag += lg[j][BowVector.FREQ_KEY] ** 2;
      }
    }

    return dotProd / (Math.sqrt(v1mag) * Math.sqrt(v2mag));
  }

  similarity(that) {
    const [sm, lg] = this._swap(that, 0, 0);
    if (sm === null) {
      return lg;
    }

    return this._similarity(sm, lg);
  }
}

module.exports = { BowVector };
