import axiosInstance from '../../core/apis/axiosInstance';

export interface IAppNotification {
    id: number;
    title: string;
    message: string;
    type: string;
    requestId: number | null;
    link: string | null;
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
