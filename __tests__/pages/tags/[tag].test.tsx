import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Tag from '../../../src/pages/tags/[tag]';

describe('Tag', () => {
    it('renders', () => {
        const { container } = render(<Tag tag='test-tag' />);
        expect(container).toMatchSnapshot()
    });
});
