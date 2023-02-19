import { humanTime } from '@app/common/human-time';

import '@testing-library/jest-dom';

describe('humanTime', () => {
    it('returns now for the current time', () => {
        const time = humanTime(new Date(), 'en-AU');
        expect(time).toBe('now');
    });

    it('returns english by default', () => {
        const time = humanTime(new Date());
        expect(time).toBe('now');
    });

    it('falls back to english if a locale hasn\'t been registered', () => {
        const time = humanTime(new Date(), 'non-existant');
        expect(time).toBe('now');
    });

    it('allows the locale to be set', () => {
        const time = humanTime(new Date(), 'ru');
        expect(time).toBe('только что');
    });
});
