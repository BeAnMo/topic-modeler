const { BasicTrie } = require('a-trie-grows-in-js');


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
            cursor[this.EOI] = new BowVector(
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

    /**
     * @yields {[string, BowVector]}
     */
    *all() {
        yield* this._traverse();
    }
}

module.exports = BowVectorTrie