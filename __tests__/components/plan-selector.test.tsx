import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PlanSelector } from '@app/components/plan-selector';

describe('PlanSelector', () => {
  it("doesn't render when hidden", () => {
    const { container } = render(<PlanSelector hidden={true} />);
    expect(container).toMatchSnapshot();
  });

  it('renders when not hidden', () => {
    const { container } = render(<PlanSelector hidden={false} />);
    expect(container).toMatchSnapshot();
  });
});
