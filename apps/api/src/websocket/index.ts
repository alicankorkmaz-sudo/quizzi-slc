import type { ServerWebSocket } from 'bun';
import { connectionManager } from './connection-manager';
import { handleMessage } from './handlers';
import type { WebSocketData } from './types';

/**
 * WebSocket handler for Bun.serve
 */
export const wsHandler = {
  /**
   * Handle new WebSocket connection
   */
  open(ws: ServerWebSocket<WebSocketData>) {
    const userId = ws.data.userId;

    if (!userId) {
      console.error('WebSocket opened without userId');
      ws.close(1008, 'Missing user ID');
      return;
    }

    connectionManager.addConnection(userId, ws);
    console.log(`WebSocket opened: ${userId}`);
  },

  /**
   * Handle incoming message
   */
  message(ws: ServerWebSocket<WebSocketData>, message: string | Buffer) {
    const userId = ws.data.userId;

    if (!userId) {
      console.error('Message received from connection without userId');
      return;
    }

    try {
      const data = JSON.parse(message.toString());
      handleMessage(userId, data);
    } catch (error) {
      console.error(`Invalid message format from ${userId}:`, error);
      connectionManager.send(userId, {
        type: 'error',
        code: 'invalid_message',
        message: 'Invalid message format',
      });
    }
  },

  /**
   * Handle WebSocket close
   */
  close(ws: ServerWebSocket<WebSocketData>) {
    const userId = ws.data.userId;

    if (!userId) {
      return;
    }

    // Get player's current match
    const matchId = require('./match-manager').matchManager.getPlayerMatch(userId);

    connectionManager.removeConnection(userId, matchId);
    console.log(`WebSocket closed: ${userId}`);
  },

  /**
   * Handle WebSocket error
   */
  error(ws: ServerWebSocket<WebSocketData>, error: Error) {
    const userId = ws.data.userId || 'unknown';
    console.error(`WebSocket error for ${userId}:`, error);
  },
};

/**
 * Initialize WebSocket infrastructure
 */
export function initializeWebSocket(): void {
  connectionManager.initialize();
  console.log('WebSocket infrastructure initialized');
}

/**
 * Shutdown WebSocket infrastructure
 */
export function shutdownWebSocket(): void {
  connectionManager.shutdown();
  console.log('WebSocket infrastructure shutdown');
}
