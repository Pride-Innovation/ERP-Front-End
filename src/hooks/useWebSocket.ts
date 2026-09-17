import { useEffect, useRef, useCallback } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/*
 * The STOMP endpoint, derived from the API base URL.
 *
 * Strips `/api/v1` (and any trailing slash) to get the server root. `REACT_APP_BASE_URL` may carry a
 * trailing slash — 'http://host/api/v1/' — so this is a regex replace rather than a string one, to
 * avoid a doubled slash.
 *
 * <h2>Why it falls back to the page's own origin</h2>
 * Production must serve this application from the **same origin** as the API, because the firewall
 * blocks OPTIONS and a CORS preflight is an OPTIONS request. Same-origin means `REACT_APP_BASE_URL`
 * becomes a relative path like `/api/v1`, and stripping `/api/v1` from that leaves an empty string —
 * so this would have built `"/ws"`, and SockJS requires an absolute URL. The websocket would have
 * failed on the day of that switch, taking live notifications with it, for a reason nowhere near the
 * change that caused it.
 *
 * Resolving against `window.location.origin` costs nothing today (an absolute base URL is unchanged)
 * and is what lets the same-origin move be a configuration change rather than a code change.
 */
const API_SERVER_ROOT = (process.env.REACT_APP_BASE_URL || '').replace(/\/api\/v1\/?.*$/, '');
const WS_URL = `${API_SERVER_ROOT || window.location.origin}/ws`;
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
                // Canonical user-destination subscription: Spring rewrites `/user/queue/...`
                // to this session's private queue using the connection principal. This must
                // NOT include the user id — an explicit-id form registers a destination that
                // won't match what convertAndSendToUser(...) produces, so pushes never arrive.
                subscriptionRef.current = client.subscribe(
                    `/user/queue/notifications`,
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
