<script>
  import { onMount, onDestroy } from 'svelte';
  import { AutoWeaveAdapter } from '../autoweave-adapter.js';
  
  export let apiUrl = 'http://localhost:3000';
  export let wsUrl = 'ws://localhost:3000/ws';
  
  let adapter;
  let agents = [];
  let selectedAgent = null;
  let isConnected = false;
  let isLoading = false;
  let error = null;
  let newAgentDescription = '';
  
  onMount(() => {
    // Initialize AutoWeave adapter
    adapter = new AutoWeaveAdapter({ apiUrl, wsUrl });
    
    // Setup event listeners
    adapter.on('connected', () => {
      isConnected = true;
      loadAgents();
    });
    
    adapter.on('disconnected', () => {
      isConnected = false;
    });
    
    adapter.on('agentCreated', (agent) => {
      agents = [...agents, agent];
      newAgentDescription = '';
    });
    
    adapter.on('agentDeleted', (agentId) => {
      agents = agents.filter(a => a.id !== agentId);
      if (selectedAgent?.id === agentId) {
        selectedAgent = null;
      }
    });
    
    adapter.on('error', (err) => {
      error = err.message || 'An error occurred';
      setTimeout(() => error = null, 5000);
    });
    
    // Load initial data
    loadAgents();
  });
  
  onDestroy(() => {
    if (adapter) {
      adapter.disconnect();
    }
  });
  
  async function loadAgents() {
    isLoading = true;
    try {
      agents = await adapter.getAgents();
    } catch (err) {
      console.error('Failed to load agents:', err);
    } finally {
      isLoading = false;
    }
  }
  
  async function createAgent() {
    if (!newAgentDescription.trim()) return;
    
    isLoading = true;
    try {
      await adapter.createAgent(newAgentDescription);
    } catch (err) {
      console.error('Failed to create agent:', err);
    } finally {
      isLoading = false;
    }
  }
  
  async function deleteAgent(agent) {
    if (!confirm(`Delete agent "${agent.name}"?`)) return;
    
    try {
      await adapter.deleteAgent(agent.id);
    } catch (err) {
      console.error('Failed to delete agent:', err);
    }
  }
  
  function selectAgent(agent) {
    selectedAgent = agent;
    // Emit event for parent component
    dispatch('agentSelected', agent);
  }
</script>

<div class="autoweave-panel">
  <div class="panel-header">
    <h3>AutoWeave Agents</h3>
    <div class="connection-status" class:connected={isConnected}>
      {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  </div>
  
  {#if error}
    <div class="error-message">
      {error}
    </div>
  {/if}
  
  <div class="create-agent-form">
    <textarea
      bind:value={newAgentDescription}
      placeholder="Describe what you want the agent to do..."
      rows="3"
      disabled={isLoading || !isConnected}
    ></textarea>
    <button 
      on:click={createAgent}
      disabled={isLoading || !isConnected || !newAgentDescription.trim()}
    >
      {isLoading ? 'Creating...' : 'Create Agent'}
    </button>
  </div>
  
  <div class="agents-list">
    {#if isLoading && agents.length === 0}
      <div class="loading">Loading agents...</div>
    {:else if agents.length === 0}
      <div class="empty">No agents found. Create your first agent!</div>
    {:else}
      {#each agents as agent}
        <div 
          class="agent-card"
          class:selected={selectedAgent?.id === agent.id}
          on:click={() => selectAgent(agent)}
        >
          <div class="agent-name">{agent.name}</div>
          <div class="agent-description">{agent.description}</div>
          <div class="agent-footer">
            <span class="agent-status">{agent.status}</span>
            <button 
              class="delete-btn"
              on:click|stopPropagation={() => deleteAgent(agent)}
            >
              Delete
            </button>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .autoweave-panel {
    background: var(--bg-1);
    border: 1px solid var(--border-1);
    border-radius: 8px;
    padding: 1rem;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-1);
  }
  
  .panel-header h3 {
    margin: 0;
    font-size: 1.2rem;
    color: var(--text-1);
  }
  
  .connection-status {
    font-size: 0.875rem;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    background: var(--bg-2);
    color: var(--text-2);
  }
  
  .connection-status.connected {
    background: #4caf50;
    color: white;
  }
  
  .error-message {
    background: #f44336;
    color: white;
    padding: 0.5rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }
  
  .create-agent-form {
    margin-bottom: 1rem;
  }
  
  .create-agent-form textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--border-1);
    border-radius: 4px;
    background: var(--bg-2);
    color: var(--text-1);
    resize: vertical;
    font-family: inherit;
    margin-bottom: 0.5rem;
  }
  
  .create-agent-form button {
    width: 100%;
    padding: 0.5rem 1rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: opacity 0.2s;
  }
  
  .create-agent-form button:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  .create-agent-form button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .agents-list {
    flex: 1;
    overflow-y: auto;
  }
  
  .loading, .empty {
    text-align: center;
    color: var(--text-2);
    padding: 2rem;
  }
  
  .agent-card {
    background: var(--bg-2);
    border: 1px solid var(--border-1);
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .agent-card:hover {
    border-color: var(--primary);
  }
  
  .agent-card.selected {
    border-color: var(--primary);
    background: var(--bg-3);
  }
  
  .agent-name {
    font-weight: 600;
    color: var(--text-1);
    margin-bottom: 0.25rem;
  }
  
  .agent-description {
    font-size: 0.875rem;
    color: var(--text-2);
    margin-bottom: 0.5rem;
  }
  
  .agent-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .agent-status {
    font-size: 0.75rem;
    color: var(--text-3);
    text-transform: uppercase;
  }
  
  .delete-btn {
    padding: 0.25rem 0.5rem;
    background: transparent;
    color: #f44336;
    border: 1px solid #f44336;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .delete-btn:hover {
    background: #f44336;
    color: white;
  }
</style>