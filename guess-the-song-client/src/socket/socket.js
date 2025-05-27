import { io } from 'socket.io-client';
//export const socket = io(import.meta.env.VITE_SERVER_URL);

export const socket = io('http://localhost:4000');