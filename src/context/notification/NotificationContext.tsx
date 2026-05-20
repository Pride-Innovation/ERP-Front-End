import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { IAppNotification, fetchNotifications, fetchUnreadCount, markAllRead, markRead } from './service';
import RoutesUtills from '../../core/routes/utills';
import { useWebSocket } from '../../hooks/useWebSocket';

interface INotificationContext {
    notifications: IAppNotification[];
    unreadCount: number;
    loadNotifications: () => Promise<void>;
    handleMarkRead: (id: number) => Promise<void>;
    handleMarkAllRead: () => Promise<void>;
}

export const NotificationContext = createContext<INotificationContext>({} as INotificationContext);

export const NotificationContextProvider = ({ children }: { children: React.ReactNode }) => {
    const { getCurrentUser } = RoutesUtills();
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;

    const [notifications, setNotifications] = useState<IAppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);

    const loadNotifications = useCallback(async () => {
        if (!userId) return;
        try {
            const [notifRes, countRes] = await Promise.all([
                fetchNotifications(0, 20),
                fetchUnreadCount(),
            ]);
            setNotifications(notifRes.data.content || []);
            setUnreadCount(countRes.data || 0);
        } catch (e) {
            // swallow errors to avoid breaking navbar
        }
    }, [userId]);

    const handleMarkRead = async (id: number) => {
        await markRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleMarkAllRead = async () => {
        await markAllRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    // Handle real-time push notifications
    const handleWsMessage = useCallback((body: string) => {
        try {
            const incoming: IAppNotification = JSON.parse(body);
            setNotifications(prev => [incoming, ...prev]);
            setUnreadCount(prev => prev + 1);
        } catch (e) {
            // ignore malformed messages
        }
    }, []);

    useWebSocket({ userId, onMessage: handleWsMessage, enabled: !!userId });

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loadNotifications,
            handleMarkRead,
            handleMarkAllRead,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
