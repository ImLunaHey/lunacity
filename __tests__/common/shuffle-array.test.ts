import { shuffleArray } from '@app/common/shuffle-array';

describe('shuffleArray', () => {
    it('should shuffle an array of items', () => {
        const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const shuffled = shuffleArray(arr);
        expect(shuffled).not.toEqual(arr);
        expect(shuffled.sort((a, b) => a - b)).toEqual(arr);
    });
});
