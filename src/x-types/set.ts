const {
  intersection,
  difference,
  union,
  similarity,
  findPossibleIndex,
  findIndex,
} = require('arrset/dist/optimized');

export class xSet<Item> {
  items: Item[];
  size: number;

  constructor(items?: Item[], ignorePrep = false) {
    // Default sort is not "correct" but allows consistent
    // usage of < & >
    if (!Array.isArray(items)) {
      this.items = [];
    } else if (ignorePrep) {
      this.items = items;
    } else {
      this.items = [...new Set(items.sort())];
    }
    this.size = this.items.length;
  }

  *[Symbol.iterator]() {
    for (const item of this.items) {
      yield item;
    }
  }

  toString() {
    return this.items;
  }

  toJSON() {
    return this.toString();
  }

  toArray() {
    return this.items;
  }

  add(item: Item): xSet<Item> {
    if (item === undefined) {
      return this;
    }
    const insertAt = findPossibleIndex(this.items, item);

    if (insertAt !== -1) {
      this.items.splice(insertAt, 0, item);
      this.size += 1;
    }

    return this;
  }

  delete(item: Item): xSet<Item> {
    if (item === undefined) {
      return this;
    }
    const insertAt = findIndex(this.items, item);

    if (insertAt !== -1) {
      this.items.splice(insertAt, 1);
      this.size -= 1;
    }

    return this;
  }

  has(item: Item): boolean {
    if (item === undefined) {
      return false;
    }
    return findIndex(this.items, item) >= 0;
  }

  difference(other: xSet<Item>): xSet<Item> {
    return new xSet(difference(this.items, other.items), true);
  }

  union(other: xSet<Item>): xSet<Item> {
    const nextSet =
      this.size <= other.size
        ? union(this.items, other.items)
        : union(other.items, this.items);

    return new xSet(nextSet, true);
  }

  intersection(other: xSet<Item>): xSet<Item> {
    const nextSet =
      this.size <= other.size
        ? intersection(this.items, other.items)
        : intersection(other.items, this.items);

    return new xSet(nextSet, true);
  }

  similarity(other: xSet<Item>): xSet<Item> {
    return this.size <= other.size
      ? similarity(this.items, other.items)
      : similarity(other.items, this.items);
  }
}
