import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchIcon } from '@app/icons/search-icon';

describe('SearchIcon', () => {
    it('renders', () => {
        const { container } = render(<SearchIcon />);
        expect(container).toMatchSnapshot();
    });

    it('renders with custom size', () => {
        const { container } = render(<SearchIcon size={200} />);
        expect(container).toMatchSnapshot();
    });

    it('renders with custom width/height', () => {
        const { container } = render(<SearchIcon width={10} height={10} />);
        expect(container).toMatchSnapshot();
    });
});
