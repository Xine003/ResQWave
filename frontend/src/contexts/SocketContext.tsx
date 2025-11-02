/* eslint-disable react-refresh/only-export-components */
import { disconnectSocket, initializeSocket } from '@/services/socketService';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Get JWT token from localStorage (matches AuthContext key)
    const token = localStorage.getItem('resqwave_token');

    if (!token) {
      console.log('[SocketContext] No token found, skipping connection');
      return;
    }

    console.log('[SocketContext] Initializing socket connection with token');
    const socketInstance = initializeSocket(token);
    setSocket(socketInstance);

    // Listen for connection status changes
    const handleConnect = () => {
      console.log('[SocketContext] Socket connected');
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log('[SocketContext] Socket disconnected');
      setIsConnected(false);
    };

    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);

    // Cleanup on unmount
    return () => {
      console.log('[SocketContext] Cleaning up socket connection');
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
      disconnectSocket();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
