import { create } from 'zustand';
import { mountStoreDevtool } from 'simple-zustand-devtools';
import { type RouterOutputs } from '@app/utils/api';

export type Notification = RouterOutputs['notification']['getAllNotifications'][number];

type State = {
    notifications: Notification[];
    addNotification: (notification: Notification) => void;
    addNotifications: (notifications: Notification[]) => void;
}

export const useNotificationStore = create<State>(set => ({
    notifications: [],
    addNotification(notification) {
        set(state => ({
            ...state,
            notifications: [...state.notifications, notification]
        }));
    },
    addNotifications(notifications) {
        set(state => ({
            ...state,
            notifications
        }));
    },
}));

// Allow inspecting via react devtools
// https://github.com/beerose/simple-zustand-devtools
if (process.env.NODE_ENV === 'development') {
    mountStoreDevtool('Store', useNotificationStore);
}
