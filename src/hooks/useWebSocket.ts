import { useEffect, useRef, useCallback } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Strip /api/v1 (and any trailing slash) from the base URL to derive the server root.
// REACT_APP_BASE_URL may include a trailing slash (e.g. 'http://host/api/v1/'),
// so we use a regex replace rather than a simple string replace to avoid double-slash paths.
const WS_URL = `${(process.env.REACT_APP_BASE_URL || '').replace(/\/api\/v1\/?.*$/, '')}/ws`;
const ACCESS_TOKEN_KEY = 'access-token';

interface UseWebSocketOptions {
    userId: number | string | undefined;
    onMessage: (body: string) => void;
    enabled?: boolean;
}

export const useWebSocket = ({ userId, onMessage, enabled = true }: UseWebSocketOptions) => {
    const clientRef = useRef<Client | null>(null);
    const subscriptionRef = useRef<StompSubscription | null>(null);

    const connect = useCallback(() => {
        if (!userId || !enabled) return;

        const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);

        const client = new Client({
            webSocketFactory: () => new SockJS(WS_URL) as WebSocket,
            reconnectDelay: 5000,
            connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
            onConnect: () => {
                subscriptionRef.current = client.subscribe(
                    `/user/${userId}/queue/notifications`,
                    (message: IMessage) => {
                        onMessage(message.body);
                    }
                );
            },
            onStompError: (frame) => {
                console.error('STOMP error', frame);
            },
        });

        client.activate();
        clientRef.current = client;
    }, [userId, onMessage, enabled]);

    useEffect(() => {
        connect();
        return () => {
            subscriptionRef.current?.unsubscribe();
            clientRef.current?.deactivate();
        };
    }, [connect]);
};
