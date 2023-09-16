import { BasicTrie } from 'a-trie-grows-in-js';
import { SORT_KEY, FREQ_KEY, BowVector } from './x-types/vector'


export default class BowVectorTrie extends BasicTrie {
    branches: number;
    leaves: number;

    constructor() {
        super();
        // Count of unique full keys.
        this.branches = 0;
        // Count of all vector elements.
        this.leaves = 0;
    }

    add(key: string, val: string, freq = 0): BowVectorTrie {
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

    delete(word: string): BowVectorTrie {
        let [cursor, parent] = this._cursor(word, 0, 1);

        if (cursor !== this.NONE) {
            const vectorLen = cursor[this.EOI].length;
            delete parent[word.slice(-1)[0]];
            this.branches--;
            this.leaves -= vectorLen;
        }

        return this;
    }

    *[Symbol.iterator](): Generator<[string, BowVector], any, unknown> {
        for (const [doc, vector] of this._traverse()) {
            yield [doc, vector];
        }
    }
}
