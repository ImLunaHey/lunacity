/**
 * Shuffle an array of items
 * @Source: https://stackoverflow.com/a/46161940
 */
export const shuffleArray = <T>(arr: T[]): T[] => {
    const newArr = arr.slice();
    for (let i = newArr.length - 1; i > 0; i--) {
        const rand = Math.floor(Math.random() * (i + 1));
        [newArr[i] as unknown, newArr[rand] as unknown] = [newArr[rand], newArr[i]];
    }
    return newArr;
};
