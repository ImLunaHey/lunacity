import { NotificationIcon } from '@app/icons/notification-icon';

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('NotificationIcon', () => {
    it('renders an icon', () => {
        const { container } = render(<NotificationIcon />);
        expect(container).toMatchSnapshot();
    });
});
