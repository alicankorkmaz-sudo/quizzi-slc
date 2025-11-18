/**
 * React hook for WebSocket service
 * Manages WebSocket lifecycle and provides event subscription
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { WebSocketService, type WebSocketConfig, type ServerEvent, type ClientEvent } from '../services/websocket';

// Production WebSocket URL
const WS_URL = 'wss://quizzi-slc-production.up.railway.app/ws';

export function useWebSocket(userId: string | null) {
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'reconnecting'
  >('disconnected');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocketService | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!userId || hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    const config: WebSocketConfig = {
      url: WS_URL,
      userId,
      token: '', // TODO: Add actual token when this hook is used
      onConnect: () => {
        console.log('[useWebSocket] Connected');
        setConnectionStatus('connected');
        setIsConnected(true);
      },
      onDisconnect: () => {
        console.log('[useWebSocket] Disconnected');
        setConnectionStatus('disconnected');
        setIsConnected(false);
      },
      onError: (err) => {
        console.error('[useWebSocket] Error:', err);
        setConnectionStatus('disconnected');
      },
    };

    wsRef.current = new WebSocketService(config);
    setConnectionStatus('connecting');

    wsRef.current.connect().catch((err) => {
      console.error('[useWebSocket] Failed to connect:', err);
      setConnectionStatus('disconnected');
    });

    // Cleanup on unmount
    return () => {
      wsRef.current?.disconnect();
      wsRef.current = null;
      hasInitialized.current = false;
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
      if (!wsRef.current) return () => {};
      return wsRef.current.on(eventType, callback);
    },
    []
  );

  return {
    connectionStatus,
    isConnected,
    send,
    subscribe,
  };
}
