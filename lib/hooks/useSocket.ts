import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to the Socket.IO server
    // Assuming the server is running on the same host/port or configured via env
    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || window.location.origin;
    
    // Check if we are already connected or connecting
    if (!socketRef.current) {
        const socket = io(socketUrl, {
            path: '/api/socket', // Adjust path if using Next.js API route or custom server
            transports: ['websocket'],
            autoConnect: true,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
            setIsConnected(false);
        });
    }

    return () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    };
  }, []);

  return { socket: socketRef.current, isConnected };
};
