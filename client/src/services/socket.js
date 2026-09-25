import { io } from 'socket.io-client';
import { getToken, getServerUrl } from './api';

let socket = null;

export function getSocket() {
  if (!socket) {
    const token = getToken();
    const serverUrl = getServerUrl();
    const socketOrigin = serverUrl || (typeof window !== 'undefined' ? window.location.origin : '/');

    socket = io(socketOrigin, {
      auth: { token },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });
  }
  return socket;
}

export function connectSocket() {
  const token = getToken();
  if (!token) return null;

  const s = getSocket();
  s.auth = { token };
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Automatically reconnect socket if server URL is changed
if (typeof window !== 'undefined') {
  window.addEventListener('server-url:changed', () => {
    disconnectSocket();
    if (getToken()) {
      connectSocket();
    }
  });
}
