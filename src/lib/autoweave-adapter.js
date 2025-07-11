/**
 * @module @autoweave/ui/lib/autoweave-adapter
 * @description Adapter for integrating AutoWeave with chat interfaces
 */

import { EventEmitter } from 'events';

export class AutoWeaveAdapter extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            apiUrl: config.apiUrl || 'http://localhost:3000',
            wsUrl: config.wsUrl || 'ws://localhost:3000/ws',
            reconnectInterval: config.reconnectInterval || 5000,
            maxReconnectAttempts: config.maxReconnectAttempts || 10,
            ...config
        };
        
        this.ws = null;
        this.reconnectAttempts = 0;
        this.isConnected = false;
        
        this.initWebSocket();
    }

    /**
     * Initialize WebSocket connection
     */
    initWebSocket() {
        try {
            this.ws = new WebSocket(this.config.wsUrl);
            
            this.ws.onopen = () => {
                console.log('AutoWeave WebSocket connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.emit('connected');
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleWebSocketMessage(message);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.emit('error', error);
            };
            
            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.isConnected = false;
                this.emit('disconnected');
                this.attemptReconnect();
            };
            
        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
            this.emit('error', error);
        }
    }

    /**
     * Handle incoming WebSocket messages
     */
    handleWebSocketMessage(message) {
        switch (message.type) {
            case 'chat':
                this.emit('chat', message.content);
                break;
            case 'display':
                this.emit('display', message.template, message.data);
                break;
            case 'status':
                this.emit('status', message.content);
                break;
            case 'error':
                this.emit('error', message.content);
                break;
            default:
                this.emit('message', message);
        }
    }

    /**
     * Attempt to reconnect WebSocket
     */
    attemptReconnect() {
        if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            this.emit('reconnectFailed');
            return;
        }
        
        this.reconnectAttempts++;
        console.log(`Attempting reconnect ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}...`);
        
        setTimeout(() => {
            this.initWebSocket();
        }, this.config.reconnectInterval);
    }

    /**
     * Send message via WebSocket
     */
    sendWebSocketMessage(type, content) {
        if (!this.isConnected || !this.ws) {
            throw new Error('WebSocket not connected');
        }
        
        this.ws.send(JSON.stringify({ type, content }));
    }

    /**
     * Create a new agent
     */
    async createAgent(description, options = {}) {
        try {
            const response = await fetch(`${this.config.apiUrl}/api/agents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ description, ...options })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            this.emit('agentCreated', result);
            return result;
            
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Get all agents
     */
    async getAgents() {
        try {
            const response = await fetch(`${this.config.apiUrl}/api/agents`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
            
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Delete an agent
     */
    async deleteAgent(agentId) {
        try {
            const response = await fetch(`${this.config.apiUrl}/api/agents/${agentId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.emit('agentDeleted', agentId);
            return true;
            
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Search memory
     */
    async searchMemory(query, options = {}) {
        try {
            const response = await fetch(`${this.config.apiUrl}/api/memory/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query, ...options })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
            
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Send chat message
     */
    async sendChat(message, options = {}) {
        try {
            // Send via WebSocket if connected
            if (this.isConnected) {
                this.sendWebSocketMessage('chat', { text: message, ...options });
            }
            
            // Also send via HTTP API
            const response = await fetch(`${this.config.apiUrl}/api/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: message }],
                    ...options
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
            
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Get system health
     */
    async getHealth() {
        try {
            const response = await fetch(`${this.config.apiUrl}/health`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
            
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Execute command
     */
    sendCommand(command, args = {}) {
        if (!this.isConnected) {
            throw new Error('WebSocket not connected');
        }
        
        this.sendWebSocketMessage('command', { command, args });
    }

    /**
     * Submit input form
     */
    submitInput(action, values) {
        if (!this.isConnected) {
            throw new Error('WebSocket not connected');
        }
        
        this.sendWebSocketMessage('input', { action, values });
    }

    /**
     * Disconnect and cleanup
     */
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
        this.removeAllListeners();
    }
}

// Export for CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AutoWeaveAdapter };
}