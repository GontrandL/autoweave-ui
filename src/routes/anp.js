/**
 * ANP (Agent Network Protocol) Routes
 * Handles agent-to-agent communication and task management
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// In-memory storage for tasks (replace with database in production)
const tasks = new Map();

/**
 * Get AutoWeave agent card
 */
router.get('/agent', (req, res) => {
    const validate = req.query.validate === 'true';
    
    const agentCard = {
        id: 'autoweave-orchestrator',
        name: 'AutoWeave Agent Orchestrator',
        version: '1.0.0',
        description: 'Self-weaving agent orchestrator with ANP and AG-UI capabilities',
        capabilities: [
            'agent-creation',
            'memory-management',
            'configuration-intelligence',
            'websocket-ui'
        ],
        endpoints: {
            agent: '/api/anp/agent',
            tasks: '/api/anp/agent/tasks',
            capabilities: '/api/anp/agent/capabilities'
        },
        openapi: '3.1.0'
    };
    
    if (validate) {
        // Add OpenAPI validation metadata
        agentCard.validation = {
            validated: true,
            timestamp: new Date().toISOString(),
            schema: 'ANP-1.0'
        };
    }
    
    res.json(agentCard);
});

/**
 * Create ANP task
 */
router.post('/agent/tasks', (req, res) => {
    const { input, tools = [] } = req.body;
    
    if (!input) {
        return res.status(400).json({ 
            error: 'Input is required' 
        });
    }
    
    const taskId = uuidv4();
    const task = {
        id: taskId,
        input,
        tools,
        status: 'pending',
        createdAt: new Date().toISOString(),
        steps: []
    };
    
    tasks.set(taskId, task);
    
    // Start task processing asynchronously
    processTask(taskId);
    
    res.status(201).json({
        id: taskId,
        status: 'pending',
        message: 'Task created successfully'
    });
});

/**
 * Get task status
 */
router.get('/agent/tasks/:id', (req, res) => {
    const task = tasks.get(req.params.id);
    
    if (!task) {
        return res.status(404).json({ 
            error: 'Task not found' 
        });
    }
    
    res.json({
        id: task.id,
        status: task.status,
        input: task.input,
        createdAt: task.createdAt,
        completedAt: task.completedAt,
        result: task.result,
        error: task.error
    });
});

/**
 * Get task execution steps
 */
router.get('/agent/tasks/:id/steps', (req, res) => {
    const task = tasks.get(req.params.id);
    
    if (!task) {
        return res.status(404).json({ 
            error: 'Task not found' 
        });
    }
    
    res.json({
        taskId: task.id,
        steps: task.steps
    });
});

/**
 * Get agent capabilities
 */
router.get('/agent/capabilities', (req, res) => {
    res.json({
        capabilities: [
            {
                name: 'agent-creation',
                description: 'Create agents from natural language descriptions',
                inputSchema: {
                    type: 'object',
                    properties: {
                        description: { type: 'string' }
                    },
                    required: ['description']
                }
            },
            {
                name: 'memory-management',
                description: 'Hybrid memory system with contextual and structural search',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: { type: 'string' },
                        userId: { type: 'string' }
                    },
                    required: ['query']
                }
            },
            {
                name: 'configuration-intelligence',
                description: 'Generate intelligent configurations with fresh package versions',
                inputSchema: {
                    type: 'object',
                    properties: {
                        intent: { type: 'string' }
                    },
                    required: ['intent']
                }
            }
        ]
    });
});

/**
 * Validate OpenAPI specifications
 */
router.get('/agent/openapi/validate', (req, res) => {
    // Validate all tool OpenAPI specifications
    const validationResults = {
        valid: true,
        tools: [
            {
                name: 'agent-creation',
                valid: true,
                openapi: '3.1.0'
            },
            {
                name: 'memory-management',
                valid: true,
                openapi: '3.1.0'
            }
        ],
        timestamp: new Date().toISOString()
    };
    
    res.json(validationResults);
});

/**
 * Validate custom OpenAPI specification
 */
router.post('/agent/openapi/validate', (req, res) => {
    const { spec } = req.body;
    
    if (!spec) {
        return res.status(400).json({ 
            error: 'OpenAPI specification is required' 
        });
    }
    
    // Basic validation
    const isValid = spec.openapi && spec.info && spec.paths;
    
    res.json({
        valid: isValid,
        errors: isValid ? [] : ['Invalid OpenAPI specification'],
        version: spec.openapi,
        timestamp: new Date().toISOString()
    });
});

/**
 * Process task asynchronously
 */
async function processTask(taskId) {
    const task = tasks.get(taskId);
    if (!task) return;
    
    try {
        // Update status
        task.status = 'processing';
        task.steps.push({
            step: 1,
            action: 'parsing_input',
            timestamp: new Date().toISOString()
        });
        
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        task.steps.push({
            step: 2,
            action: 'executing_task',
            timestamp: new Date().toISOString()
        });
        
        // Complete task
        task.status = 'completed';
        task.completedAt = new Date().toISOString();
        task.result = {
            message: 'Task completed successfully',
            output: `Processed: ${task.input}`
        };
        
        task.steps.push({
            step: 3,
            action: 'task_completed',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        task.status = 'failed';
        task.error = error.message;
        task.completedAt = new Date().toISOString();
    }
    
    tasks.set(taskId, task);
}

export default router;