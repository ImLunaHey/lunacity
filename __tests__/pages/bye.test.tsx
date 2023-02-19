import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Bye from '@app/pages/bye';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: jest.fn((text: string, args) => (args ? `${text} ${JSON.stringify(args, null)}` : text)),
    ready: true,
  })),
}));

describe('Bye', () => {
  it('when unauthenticated it renders a goodbye message', () => {
    const { container } = render(<Bye />);
    expect(container).toMatchSnapshot();
  });
});
