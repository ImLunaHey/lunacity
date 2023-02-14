import { humanTime } from '../../src/common/human-time';

import '@testing-library/jest-dom';

describe('humanTime', () => {
    it('returns now for the current time', () => {
        const time = humanTime(new Date(), 'en-AU');
        expect(time).toBe('now');
    });
});
