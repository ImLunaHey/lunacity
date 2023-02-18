import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Tag from '@app/pages/tags/[tag]';

jest.mock('@app/server/auth', () => ({
  getServerAuthSession: jest.fn(() => null),
}));

describe('Tag', () => {
  it('renders', () => {
    const { container } = render(<Tag tag="test-tag" />);
    expect(container).toMatchSnapshot();
  });
});
