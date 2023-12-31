const { BowVector } = require('./vector.js');

describe('BowVector', () => {
  describe('creating a vector', () => {
    describe('when ignoring the input sort', () => {
      it('should add array as is', () => {
        const arr = [
          { w: 'hi', f: 3 },
          { w: 'he', f: 2 },
          { w: 'ho', f: 3 },
        ];
        const v = new BowVector(arr, true).toArray();
        expect(v.at(0)).toEqual(arr[0]);
      });
    });

    describe('when using the input sort', () => {
      it('should sort the array', () => {
        const leastWord = 'he';
        const arr = [
          { w: 'hi', f: 3 },
          { w: 'he', f: 2 },
          { w: 'ho', f: 3 },
        ];
        const v = new BowVector(arr, false).toArray();
        expect(v.at(0).w).toEqual(leastWord);
      });
    });
  });

  describe('adding an element', () => {
    describe('when starting with an empty vector', () => {
      it('should insert at the first position', () => {
        const word = 'ha';
        const v = new BowVector();
        v.push(word, 1);
        expect(v.toArray().at(0).w).toEqual(word);
      });
    });

    describe('when starting with a one element vector', () => {
      it('should insert at the first position', () => {
        const word = 'ha';
        const v = new BowVector([BowVector.makeVectElem('he', 1)]);
        v.push(word, 1);
        expect(v.toArray().at(0).w).toEqual(word);
      });

      it('should insert at the last position', () => {
        const word = 'hy';
        const v = new BowVector([BowVector.makeVectElem('he', 1)]);
        v.push(word, 1);
        expect(v.toArray().at(1).w).toEqual(word);
      });
    });

    describe('when the new element word is "less than" the others', () => {
      it('should push to the start of the array', () => {
        const arr = [
          { w: 'he', f: 2 },
          { w: 'hi', f: 3 },
          { w: 'ho', f: 3 },
        ];
        const word = 'ha';
        const v = new BowVector(arr, true);
        v.push(word, 10);
        expect(v.toArray().at(0).w).toEqual(word);
      });
    });

    describe('when the new element word is "greater than" the others', () => {
      it('should push to the end of the array', () => {
        const arr = [
          { w: 'he', f: 2 },
          { w: 'hi', f: 3 },
          { w: 'ho', f: 3 },
        ];
        const word = 'hu';
        const v = new BowVector(arr, true);
        v.push(word, 10);
        expect(v.toArray().at(-1).w).toEqual(word);
      });
    });

    describe('when the new element word is in the middle of the others', () => {
      it('should push to the middle of the array', () => {
        const arr = [
          { w: 'he', f: 2 },
          { w: 'hi', f: 3 },
          { w: 'ho', f: 3 },
        ];
        const word = 'hit';
        const v = new BowVector(arr, true);
        v.push(word, 10);
        expect(v.toArray().at(2).w).toEqual(word);
      });
    });

    describe('when the new element is already present in the vector', () => {
      it('should increase the frequency', () => {
        const arr = [
          { w: 'he', f: 2 },
          { w: 'hi', f: 3 },
          { w: 'ho', f: 3 },
        ];
        const word = 'hi';
        const v = new BowVector(arr, true);
        v.push(word, 10);
        expect(v.toArray().at(1).w).toEqual(word);
        expect(v.toArray().at(1).f).toEqual(10 + 3);
      });
    });
  });

  describe('removing an element', () => {
    it('should remove that entry from the array', () => {
      const arr = [
        { w: 'he', f: 2 },
        { w: 'hi', f: 3 },
        { w: 'ho', f: 3 },
      ];
      const word = 'hi';
      const v = new BowVector([...arr], true);
      v.delete(word);
      expect(v.toArray().length).toEqual(arr.length - 1);
      expect(v.get(word)).toBeFalsy();
    });
  });

  describe('math operations', () => {
    const v1 = new BowVector(
      [
        { w: 'he', f: 2 },
        { w: 'hi', f: 3 },
        { w: 'ho', f: 3 },
      ],
      1
    );
    const v2 = new BowVector(
      [
        { w: 'ha', f: 2 },
        { w: 'he', f: 3 },
        { w: 'hu', f: 3 },
      ],
      1
    );

    describe('when adding 2 vectors', () => {
      it('should increase the appropriate frequencies', () => {
        const v3 = v1.add(v2);
        expect(v3._v.length).toEqual(5);
        expect(v3.get('he')).toEqual(5);
        expect(v3.get('hu')).toEqual(3);
      });
    });

    describe('when subtracting 2 vectors', () => {
      it('should decrease the appropriate frequencies', () => {
        const v3 = v1.subtract(v2);
        expect(v3._v.length).toEqual(5);
        expect(v3.get('he')).toEqual(-1);
        expect(v3.get('hu')).toEqual(3);
      });
    });

    describe('it should calculate the correct similarity', () => {
      // v1 magnitude: (2**2) + (3**2) + (3**2) = sqrt(22)
      // v2 magnitude: same sqrt(22)
      // dot-prod: (0*1) + (2*3) + (3*0) + (3*0) + (0*3) = 6
      const sim = v1.similarity(v2);
      const calced = 6 / (Math.sqrt(22) * Math.sqrt(22));
      const margin = 0.0000001;
      expect(sim - calced < margin).toBeTruthy();
    });
  });
});
