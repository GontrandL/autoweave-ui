/**
 * Tests for AutoWeave UI Agent
 */

import { jest } from '@jest/globals';
import { UIAgent } from '../src/agui/ui-agent.js';

describe('UIAgent', () => {
    let uiAgent;
    let mockWs;

    beforeEach(() => {
        uiAgent = new UIAgent();
        mockWs = {
            send: jest.fn(),
            on: jest.fn(),
            close: jest.fn(),
            readyState: 1 // OPEN
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('handleConnection', () => {
        it('should initialize a new client connection', () => {
            const mockReq = {
                socket: { remoteAddress: '127.0.0.1' },
                headers: {}
            };

            uiAgent.handleConnection(mockWs, mockReq);

            expect(mockWs.send).toHaveBeenCalledWith(
                expect.stringContaining('"type":"welcome"')
            );
        });
    });

    describe('handleMessage', () => {
        it('should handle chat messages', async () => {
            const clientId = 'test-client';
            const message = {
                type: 'chat',
                content: { text: 'Hello AutoWeave' }
            };

            await uiAgent.handleMessage(clientId, message, mockWs);

            expect(mockWs.send).toHaveBeenCalledWith(
                expect.stringContaining('"type":"chat"')
            );
        });

        it('should handle command messages', async () => {
            const clientId = 'test-client';
            const message = {
                type: 'command',
                content: { command: 'system-health' }
            };

            await uiAgent.handleMessage(clientId, message, mockWs);

            expect(mockWs.send).toHaveBeenCalled();
        });

        it('should handle input messages', async () => {
            const clientId = 'test-client';
            const message = {
                type: 'input',
                content: {
                    action: 'create-agent',
                    values: { description: 'Test agent' }
                }
            };

            await uiAgent.handleMessage(clientId, message, mockWs);

            expect(mockWs.send).toHaveBeenCalled();
        });
    });

    describe('generateUIEvent', () => {
        it('should generate table display event', () => {
            const event = uiAgent.generateUIEvent('table', {
                headers: ['Name', 'Status'],
                rows: [['agent-1', 'active']]
            });

            expect(event).toEqual({
                type: 'display',
                template: 'table',
                data: {
                    headers: ['Name', 'Status'],
                    rows: [['agent-1', 'active']]
                }
            });
        });

        it('should generate form display event', () => {
            const event = uiAgent.generateUIEvent('form', {
                fields: [
                    { name: 'description', type: 'text', label: 'Description' }
                ]
            });

            expect(event).toEqual({
                type: 'display',
                template: 'form',
                data: {
                    fields: [
                        { name: 'description', type: 'text', label: 'Description' }
                    ]
                }
            });
        });
    });

    describe('broadcast', () => {
        it('should send message to all connected clients', () => {
            const client1 = { send: jest.fn(), readyState: 1 };
            const client2 = { send: jest.fn(), readyState: 1 };
            
            uiAgent.clients.set('client1', client1);
            uiAgent.clients.set('client2', client2);

            const message = { type: 'status', content: { message: 'Test broadcast' } };
            uiAgent.broadcast(message);

            expect(client1.send).toHaveBeenCalledWith(JSON.stringify(message));
            expect(client2.send).toHaveBeenCalledWith(JSON.stringify(message));
        });

        it('should not send to disconnected clients', () => {
            const client1 = { send: jest.fn(), readyState: 1 }; // OPEN
            const client2 = { send: jest.fn(), readyState: 3 }; // CLOSED
            
            uiAgent.clients.set('client1', client1);
            uiAgent.clients.set('client2', client2);

            const message = { type: 'status', content: { message: 'Test broadcast' } };
            uiAgent.broadcast(message);

            expect(client1.send).toHaveBeenCalled();
            expect(client2.send).not.toHaveBeenCalled();
        });
    });

    describe('error handling', () => {
        it('should handle WebSocket send errors gracefully', () => {
            const errorWs = {
                send: jest.fn().mockImplementation(() => {
                    throw new Error('WebSocket error');
                }),
                readyState: 1
            };

            const clientId = 'error-client';
            uiAgent.clients.set(clientId, errorWs);

            // Should not throw
            expect(() => {
                uiAgent.sendToClient(clientId, { type: 'test' });
            }).not.toThrow();
        });
    });
});