'use client';

import { io } from "socket.io-client";

export const socket = io({
    autoConnect: false,
});

export const connectSocket = (slug: string) => {
    if (socket.connected) return;
    socket.io.opts.query = { slug };
    socket.connect();
}
