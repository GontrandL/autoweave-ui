/**
 * @module @autoweave/ui/server
 * @description AutoWeave UI server setup with Express and WebSocket
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { UIAgent } from './agui/ui-agent.js';

// Import route handlers
import agentsRouter from './routes/agents.js';
import anpRouter from './routes/anp.js';
import chatRouter from './routes/chat.js';
import configRouter from './routes/config.js';
import healthRouter from './routes/health.js';
import memoryRouter from './routes/memory.js';
import rootRouter from './routes/index.js';
import searchRouter from './routes/search.js';
import selfAwarenessRouter from './routes/self-awareness.js';

/**
 * Create Express application with all middleware and routes
 * @returns {Express} Configured Express application
 */
export function createApp() {
    const app = express();

    // Security middleware
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", "ws:", "wss:"],
            },
        },
    }));

    // CORS configuration
    app.use(cors({
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
    }));

    // Compression
    app.use(compression());

    // Body parsing
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Rate limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use('/api/', limiter);

    // Mount routes
    app.use('/', rootRouter);
    app.use('/api/agents', agentsRouter);
    app.use('/api/anp', anpRouter);
    app.use('/api/chat', chatRouter);
    app.use('/api/config', configRouter);
    app.use('/health', healthRouter);
    app.use('/api/memory', memoryRouter);
    app.use('/api/search', searchRouter);
    app.use('/api/self-awareness', selfAwarenessRouter);

    // Error handling middleware
    app.use((err, req, res, next) => {
        console.error('Error:', err);
        res.status(err.status || 500).json({
            error: {
                message: err.message || 'Internal server error',
                ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
            }
        });
    });

    return app;
}

/**
 * Setup WebSocket server
 * @param {http.Server} server - HTTP server instance
 * @returns {WebSocketServer} Configured WebSocket server
 */
export function setupWebSocket(server) {
    const wss = new WebSocketServer({ 
        server,
        path: '/ws'
    });

    // Initialize UI Agent for WebSocket handling
    const uiAgent = new UIAgent();

    wss.on('connection', (ws, req) => {
        console.log('New WebSocket connection from:', req.socket.remoteAddress);
        
        // Handle connection with UI Agent
        uiAgent.handleConnection(ws, req);
    });

    wss.on('error', (error) => {
        console.error('WebSocket server error:', error);
    });

    return wss;
}

/**
 * Start the UI server
 * @param {number} port - Port number to listen on
 * @returns {Promise<http.Server>} HTTP server instance
 */
export async function startServer(port = 3001) {
    const app = createApp();
    
    return new Promise((resolve) => {
        const server = app.listen(port, () => {
            console.log(`AutoWeave UI server listening on port ${port}`);
            
            // Setup WebSocket
            const wss = setupWebSocket(server);
            console.log('WebSocket server initialized at /ws');
            
            resolve(server);
        });
    });
}

// Export for direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const port = process.env.UI_PORT || 3001;
    startServer(port).catch(console.error);
}