/**
 * AutoWeave UI Module
 * Main entry point
 */

// Export routes
export { default as setupRoutes } from './src/routes/index.js';
export { default as agentsRouter } from './src/routes/agents.js';
export { default as memoryRouter } from './src/routes/memory.js';
export { default as chatRouter } from './src/routes/chat.js';
export { default as healthRouter } from './src/routes/health.js';
export { default as configRouter } from './src/routes/config.js';
export { default as kagentRouter } from './src/routes/kagent.js';
export { default as searchRouter } from './src/routes/search.js';
export { default as selfAwarenessRouter } from './src/routes/self-awareness.js';

// Export AG-UI
export { UIAgent } from './src/agui/ui-agent.js';

// Export extension utilities
export const extensionConfig = {
  name: 'AutoWeave Integration',
  version: '1.0.0',
  path: './extensions/sillytavern/autoweave-extension.js',
  configPath: './extensions/sillytavern/extension-config.json'
};

// Helper function to start standalone server
export function startServer(port = 3000, options = {}) {
  const express = require('express');
  const app = express();
  
  const { default: setupRoutes } = require('./src/routes/index.js');
  setupRoutes(app, options);
  
  const server = app.listen(port, () => {
    console.log(`AutoWeave UI server running on port ${port}`);
    console.log(`WebSocket endpoint: ws://localhost:${port}/ws`);
    console.log(`API endpoint: http://localhost:${port}/api`);
  });
  
  return server;
}

// Export TypeScript types location
export const typesPath = './src/lib/autoweave-adapter.ts';