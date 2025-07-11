/**
 * @module @autoweave/ui
 * @description AutoWeave UI module - WebSocket AG-UI and API routes
 */

// Export AG-UI components
export { UIAgent } from './agui/ui-agent.js';

// Export route handlers
export { default as agentsRouter } from './routes/agents.js';
export { default as anpRouter } from './routes/anp.js';
export { default as chatRouter } from './routes/chat.js';
export { default as configRouter } from './routes/config.js';
export { default as healthRouter } from './routes/health.js';
export { default as memoryRouter } from './routes/memory.js';
export { default as rootRouter } from './routes/index.js';
export { default as searchRouter } from './routes/search.js';
export { default as selfAwarenessRouter } from './routes/self-awareness.js';

// Export WebSocket server setup
export { setupWebSocket } from './server.js';

// Export SillyTavern extension path
export const SILLYTAVERN_EXTENSION_PATH = '../extensions/sillytavern/autoweave-extension.js';

console.log('AutoWeave UI module loaded');