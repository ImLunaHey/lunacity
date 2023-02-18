import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TimeAgo } from '../../src/components/time-ago';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: jest.fn((text: string) => text),
    ready: true,
  })),
}));

describe('TimeAgo', () => {
  it('renders createdAt time if no updatedAt is provided', () => {
    const { container } = render(<TimeAgo createdAt={new Date()} />);
    expect(container).toMatchSnapshot();
  });

  it('renders createdAt time if no updatedAt is the same as createdAt', () => {
    const date = new Date();
    const { container } = render(<TimeAgo createdAt={date} updatedAt={date} />);
    expect(container).toMatchSnapshot();
  });

  it('renders updatedAt time if no updatedAt is different to createdAt', () => {
    const createdAt = new Date();
    const updatedAt = new Date(new Date().getTime() + 10_000);
    const { container } = render(<TimeAgo createdAt={createdAt} updatedAt={updatedAt} />);
    expect(container).toMatchSnapshot();
  });
});
