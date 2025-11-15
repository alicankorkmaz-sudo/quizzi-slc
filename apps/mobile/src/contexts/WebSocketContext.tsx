/**
 * WebSocket Context
 * Provides WebSocket connection to all screens and components
 * Persists across navigation
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import type { ServerEvent, ClientEvent } from '../services/websocket';

interface WebSocketContextValue {
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
  isConnected: boolean;
  send: (event: ClientEvent) => void;
  subscribe: <T extends ServerEvent['type']>(
    eventType: T,
    callback: (event: Extract<ServerEvent, { type: T }>) => void
  ) => () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  userId: string | null;
  children: ReactNode;
}

export function WebSocketProvider({ userId, children }: WebSocketProviderProps) {
  const websocket = useWebSocket(userId);

  return (
    <WebSocketContext.Provider value={websocket}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext(): WebSocketContextValue {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
}
