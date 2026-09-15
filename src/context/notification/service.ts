import axiosInstance from '../../core/apis/axiosInstance';

export interface IAppNotification {
    id: number;
    title: string;
    message: string;
    type: string;
    /**
     * What the notification is about — `'REQUEST'` / `'MOVEMENT'` — and which record.
     *
     * <p>These replaced a `link` holding a frontend URL built in Java, and a `requestId` that held a
     * *movement* id for movement notifications. `notificationRoute()` turns the pair into a route.
     */
    entityType: string | null;
    entityId: number | null;
    isRead: boolean;
    createDate: string;
}

export interface INotificationPage {
    content: IAppNotification[];
    totalElements: number;
    totalPages: number;
    number: number;
}

const BASE = '/notifications';

export const fetchNotifications = (page = 0, size = 20) =>
    axiosInstance.get<INotificationPage>(`${BASE}?page=${page}&size=${size}`);

export const fetchUnreadCount = () =>
    axiosInstance.get<number>(`${BASE}/unread-count`);

export const markRead = (id: number) =>
    axiosInstance.put(`${BASE}/${id}/read`);

export const markAllRead = () =>
    axiosInstance.put(`${BASE}/read-all`);
