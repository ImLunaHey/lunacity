import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Error from '@app/components/error';

describe('Error', () => {
  it('renders an error message', () => {
    const message = 'Not Found';
    const { container } = render(<Error message={message} />);
    expect(container).toMatchSnapshot();
    expect(container).toHaveTextContent(message);
  });
});
