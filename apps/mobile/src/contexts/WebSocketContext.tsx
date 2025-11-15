/**
 * WebSocket Context Provider
 * Provides a single WebSocket instance across the entire app
 */

import React, { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import { WebSocketService, type WebSocketConfig, type ServerEvent, type ClientEvent } from '../services/websocket';

// Use 10.0.2.2 for Android emulator to access host machine's localhost
const WS_URL = Platform.OS === 'android'
  ? 'ws://10.0.2.2:3000/ws'
  : 'ws://localhost:3000/ws';

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

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ userId, children }) => {
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'reconnecting'
  >('disconnected');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocketService | null>(null);
  const isInitializing = useRef(false);

  useEffect(() => {
    if (!userId || isInitializing.current) {
      return;
    }

    isInitializing.current = true;

    const config: WebSocketConfig = {
      url: WS_URL,
      userId,
      onConnect: () => {
        console.log('[WebSocketProvider] Connected');
        setConnectionStatus('connected');
        setIsConnected(true);
      },
      onDisconnect: () => {
        console.log('[WebSocketProvider] Disconnected');
        setConnectionStatus('disconnected');
        setIsConnected(false);
      },
      onError: (err) => {
        console.error('[WebSocketProvider] Error:', err);
        setConnectionStatus('disconnected');
      },
    };

    wsRef.current = new WebSocketService(config);
    setConnectionStatus('connecting');

    wsRef.current.connect().catch((err) => {
      console.error('[WebSocketProvider] Failed to connect:', err);
      setConnectionStatus('disconnected');
    });

    // Cleanup on unmount or userId change
    return () => {
      console.log('[WebSocketProvider] Cleaning up WebSocket');
      wsRef.current?.disconnect();
      wsRef.current = null;
      isInitializing.current = false;
    };
  }, [userId]);

  const send = useCallback((event: ClientEvent) => {
    wsRef.current?.send(event);
  }, []);

  const subscribe = useCallback(
    <T extends ServerEvent['type']>(
      eventType: T,
      callback: (event: Extract<ServerEvent, { type: T }>) => void
    ) => {
      if (!wsRef.current) {
        console.warn('[WebSocketContext] Subscribe called but no WebSocket instance');
        return () => {};
      }
      console.log(`[WebSocketContext] Subscribing to event: ${eventType}`);
      return wsRef.current.on(eventType, callback);
    },
    []
  );

  const value: WebSocketContextValue = {
    connectionStatus,
    isConnected,
    send,
    subscribe,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

/**
 * Hook to access WebSocket context
 */
export function useWebSocketContext(): WebSocketContextValue {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}
