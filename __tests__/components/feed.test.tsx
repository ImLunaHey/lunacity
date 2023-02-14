import Feed from '@app/components/feed';
import { render } from '@testing-library/react';

import '@testing-library/jest-dom';

// Mock next-auth with defaults
jest.mock('next/config', () => ({
    __esModule: true,
    default: () => ({
        publicRuntimeConfig: {
            APP_URL: 'http://localhost:3000',
            WS_URL: 'ws://localhost:3001',
        },
    }),
}));

jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(() => ({
        t: jest.fn((text: string) => text)
    })),
}));

// Mock text-post component
jest.mock('../../src/components/text-post', () => ({
    __esModule: true,
    TextPost: () => <div>__TEXT_POST__MOCK__</div>,
}));

describe('Feed', () => {
    it('renders', () => {
        const { container } = render(<Feed items={[]} />);
        expect(container).toMatchSnapshot();
    });
});
