const BowVectorTrie = require('./bow-vector-trie.js');
const { BowVector } = require('./x-types/vector.js');

describe('BowVectorTrie', () => {
  const trie = new BowVectorTrie();

  describe('adding entries', () => {
    it('should behave appropriately', () => {
      trie.add('doc1', 'word1', 2);

      expect(trie.branches).toEqual(1);
      expect(trie.leaves).toEqual(1);

      trie.add('doc1', 'word2', 2);

      expect(trie.branches).toEqual(1);
      expect(trie.leaves).toEqual(2);

      trie.add('doc2', 'word1', 1);

      expect(trie.branches).toEqual(2);
      expect(trie.leaves).toEqual(3);

      trie.add('doc3', 'word3', 5);

      expect(trie.branches).toEqual(3);
      expect(trie.leaves).toEqual(4);
    });
  });

  describe('deleting entries', () => {
    it('should behave appropriately', () => {
      trie.delete('doc2');

      expect(trie.branches).toEqual(2);
      expect(trie.leaves).toEqual(3);
      expect(trie.has('doc2')).toBeFalsy();
    });
  });

  describe('iteration', () => {
    it('should iterate correctly', () => {
      const a = [...trie];
      const b = [...trie.all()];

      expect(a).toEqual(b);
      expect(b).toEqual([
        [
          'doc1',
          new BowVector([
            BowVector.makeVectElem('word1', 2),
            BowVector.makeVectElem('word2', 2),
          ]),
        ],
        ['doc3', new BowVector([BowVector.makeVectElem('word3', 5)])],
      ]);
    });
  });
});
