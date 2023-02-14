import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TagCloud } from '../../src/components/tag-cloud';

describe('TagCloud', () => {
  it('renders an error message', () => {
    const { container } = render(
      <TagCloud
        tags={[
          {
            id: '123',
            name: 'testing',
          },
        ]}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
