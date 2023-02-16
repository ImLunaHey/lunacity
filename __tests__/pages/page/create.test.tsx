import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Create from '@app/pages/page/create';
import { api } from '@app/utils/api';
import { replaceDynamicIds } from '__tests__/__utils__/replace-dynamic-ids';

jest.mock('@app/utils/api', () => ({
  api: {
    page: {
      createPage: {
        useMutation: jest.fn(() => ({
          mutate: jest.fn(),
        })),
      },
    },
  },
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    asPath: '/',
  })),
}));

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: jest.fn((text: string) => text),
  })),
}));

describe('Create', () => {
  it('renders a create page form', () => {
    const { container } = render(<Create />);
    expect(replaceDynamicIds(container)).toMatchSnapshot();

    expect(api.page.createPage.useMutation).toBeCalledTimes(1);
  });
});
