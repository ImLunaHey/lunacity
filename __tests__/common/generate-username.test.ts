import { generateUsername } from '@app/common/generate-username';

import '@testing-library/jest-dom';

describe('generateUsername', () => {
    it('generates a random username of at least 10 characters', () => {
        const username = generateUsername();
        expect(username.length).toBeGreaterThanOrEqual(10);
    });
});
