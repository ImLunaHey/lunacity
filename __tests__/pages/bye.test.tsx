import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Bye from '../../src/pages/bye';

describe('Bye', () => {
    it('when unauthenticated it renders a goodbye message', () => {
        const { container } = render(<Bye />);
        expect(container).toMatchSnapshot()
    });
});
