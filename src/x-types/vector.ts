const { findIndex, findPossibleIndex } = require('arrset/dist/flexible');

export const SORT_KEY = 'w'; // word
export const FREQ_KEY = 'f'; // frequency

export type BowVectorVal = string;
export type BowVectorFreq = number;
export type BowVectorElem = {
  [SORT_KEY]: BowVectorVal;
  [FREQ_KEY]: BowVectorFreq;
};

export function defaultCompare(a: BowVectorElem, b: BowVectorElem): number {
  return a[SORT_KEY].localeCompare(b[SORT_KEY]);
}

export function defaultFind(word: BowVectorVal): (b: BowVectorElem) => number {
  return (b) => word.localeCompare(b[SORT_KEY]);
}

export class BowVector {
  _v: BowVectorElem[];

  constructor(items?: BowVectorElem[], ignorePrep?: boolean) {
    if (!Array.isArray(items)) {
      this._v = [];
    } else if (ignorePrep) {
      this._v = items;
    } else {
      this._v = items.sort(defaultCompare);
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
   * BagOfWordsVector. Returns the existing
   * index if WORD exists or -1 denoting a
   * a new word.
   */
  push(word: BowVectorVal, freq: number): number {
    const find = defaultFind(word);
    const existingIdx = findIndex(find, this._v);

    if (existingIdx > -1) {
      this._v[existingIdx][FREQ_KEY] += freq;
    } else {
      const newIdx = findPossibleIndex(find, this._v);
      this._v.splice(newIdx, 0, {
        [SORT_KEY]: word,
        [FREQ_KEY]: freq,
      });
    }
    return existingIdx;
  }

  delete(word: BowVectorVal): BowVector {
    const find = defaultFind(word);
    const idx = findIndex(find, this._v);

    if (idx > -1) {
      this._v.splice(idx, 1);
    }

    return this;
  }

  get(word: BowVectorVal): number | undefined {
    const find = defaultFind(word);
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
    let results: BowVectorElem[] = [];
    let i = 0;
    let j = 0;

    while (sm[i] && lg[j]) {
      const a: BowVectorElem = sm[i];
      const b: BowVectorElem = lg[j];

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

  add(that: BowVector) {
    const [sm, lg] = this._swap(that, that._v, this._v);
    if (sm === null) {
      return lg;
    }
    const res = this._join((a, b) => a + b, sm, lg);
    return new BowVector(res, true);
  }

  subtract(that: BowVector) {
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

      if (a[SORT_KEY] < b[SORT_KEY]) {
        // Equivalent of b.freq == 0
        v1mag += a[FREQ_KEY] ** 2;
        i++;
      } else if (a[SORT_KEY] > b[SORT_KEY]) {
        // Equivalent of a.freq == 0
        v2mag += b[FREQ_KEY] ** 2;
        j++;
      } else {
        v1mag += a[FREQ_KEY] ** 2;
        v2mag += b[FREQ_KEY] ** 2;
        dotProd += a[FREQ_KEY] * b[FREQ_KEY];
        i++;
        j++;
      }
    }

    if (sm[i]) {
      for (; i < sm.length; i++) {
        v1mag += sm[i][FREQ_KEY] ** 2;
      }
    }

    if (lg[j]) {
      for (; j < lg.length; j++) {
        v2mag += lg[j][FREQ_KEY] ** 2;
      }
    }

    return dotProd / (Math.sqrt(v1mag) * Math.sqrt(v2mag));
  }

  /**
   *
   * @param {BowVector} that
   * @returns {number}
   */
  similarity(that) {
    const [sm, lg] = this._swap(that, 0, 0);
    if (sm === null) {
      return lg;
    }

    return this._similarity(sm, lg);
  }
}
