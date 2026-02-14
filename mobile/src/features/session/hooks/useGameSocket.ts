import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { createStompClient } from '@/src/shared/api/socket';
import { useAuth } from '@/src/features/auth/context';

export const useGameSocket = (gameId: string) => {
    const { token } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        if (!token || !gameId) return;

        const client = createStompClient(token);

        client.onConnect = () => {
            console.log('Connected to Game Socket');
            setIsConnected(true);

            // Subscribe to Game Topic
            client.subscribe(`/topic/game/${gameId}`, (message) => {
                if (message.body) {
                    const payload = JSON.parse(message.body);
                    setMessages((prev) => [...prev, payload]);
                    console.log('Received:', payload);
                }
            });
        };

        client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
            setIsConnected(false);
        };
    }, [token, gameId]);

    const sendTag = (type: string) => {
        if (clientRef.current && clientRef.current.connected) {
            clientRef.current.publish({
                destination: `/app/game/${gameId}/tag`,
                body: JSON.stringify({
                    type,
                    timestamp: Date.now(),
                    userId: 'me', // Ideally get from Auth Context
                }),
            });
        }
    };

    return { isConnected, messages, sendTag };
};
