/**
 * AutoWeave UI Module
 * Main entry point
 */

// Export routes
export { default as setupRoutes } from './src/routes/index.js';
export { default as agentsRouter } from './src/routes/agents.js';
export { default as anpRouter } from './src/routes/anp.js';
export { default as memoryRouter } from './src/routes/memory.js';
export { default as chatRouter } from './src/routes/chat.js';
export { default as healthRouter } from './src/routes/health.js';
export { default as configRouter } from './src/routes/config.js';
export { default as kagentRouter } from './src/routes/kagent.js';
export { default as searchRouter } from './src/routes/search.js';
export { default as selfAwarenessRouter } from './src/routes/self-awareness.js';

// Export AG-UI
export { UIAgent } from './src/agui/ui-agent.js';

// Export adapter
export { AutoWeaveAdapter } from './src/lib/autoweave-adapter.js';

// Export server utilities
export { createApp, setupWebSocket, startServer } from './src/server.js';

// Export extension utilities
export const extensionConfig = {
  name: 'AutoWeave Integration',
  version: '1.0.0',
  path: './extensions/sillytavern/autoweave-extension.js',
  configPath: './extensions/sillytavern/extension-config.json'
};

// Export component paths for frameworks
export const components = {
  svelte: {
    AutoWeavePanel: './src/lib/components/AutoWeavePanel.svelte'
  }
};