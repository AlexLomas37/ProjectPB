import { Client, StompConfig } from '@stomp/stompjs';
import '@/src/shared/utils/polyfills'; // Ensure polyfills are loaded

export const createStompClient = (token: string) => {
    // Replace localhost with 10.0.2.2 for Android Emulator if needed
    // Or use your LAN IP (e.g., 192.168.1.x) for physical device testing
    const brokerURL = 'ws://192.168.1.128:8080/ws-projectpb/websocket';

    const config: StompConfig = {
        brokerURL,
        connectHeaders: {
            Authorization: `Bearer ${token}`,
        },
        debug: (str) => {
            console.log('[STOMP]', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    };

    const client = new Client(config);
    return client;
};
