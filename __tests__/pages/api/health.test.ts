import '@testing-library/jest-dom';
import health from '@app/pages/api/health';
import { apiTestHandler } from '__tests__/__utils__/api-test-handler';

describe('Health', () => {
    it('by default it returns a OK status', async () => {
        const response = await apiTestHandler(health, { method: 'GET' });

        expect(response.statusCode).toBe(200);
        expect(response._getData()).toEqual('');
    });
});
