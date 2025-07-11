# AutoWeave UI Module

Module UI d'AutoWeave incluant AG-UI (WebSocket), routes API Express et extension SillyTavern.

## Structure

```
autoweave-ui/
├── src/
│   ├── agui/
│   │   └── ui-agent.js        # Agent-GUI WebSocket système
│   ├── routes/
│   │   ├── index.js           # Routes principales et WebSocket
│   │   ├── agents.js          # API agents CRUD
│   │   ├── memory.js          # API mémoire hybride
│   │   ├── chat.js            # API chat OpenAI-compatible
│   │   ├── health.js          # Health checks
│   │   ├── config.js          # Configuration intelligence
│   │   ├── kagent.js          # Intégration kagent
│   │   ├── search.js          # Recherche unifiée
│   │   └── self-awareness.js  # Self-awareness système
│   └── lib/
│       ├── autoweave-adapter.ts    # Adapter TypeScript pour Chat-UI
│       └── components/
│           └── AutoWeavePanel.svelte # Panneau UI Svelte
├── extensions/
│   └── sillytavern/
│       ├── autoweave-extension.js  # Extension SillyTavern (565 lignes)
│       └── extension-config.json   # Configuration extension
└── package.json
```

## Installation

```bash
npm install @autoweave/ui
```

## API Endpoints

### Agent Operations
- `POST /api/agents` - Créer un agent depuis description naturelle
- `GET /api/agents` - Lister tous les agents
- `GET /api/agents/:id` - Obtenir le statut d'un agent
- `DELETE /api/agents/:id` - Supprimer un agent
- `PUT /api/agents/:id` - Mettre à jour un agent
- `POST /api/agents/:id/deploy` - Déployer un agent

### Memory Operations
- `POST /api/memory/search` - Recherche hybride (contextuelle + structurelle)
- `GET /api/memory/health` - Santé du système mémoire
- `POST /api/memory/agent/:id/memory` - Ajouter mémoire agent
- `GET /api/memory/metrics` - Métriques système mémoire
- `GET /api/memory/system/topology` - Topologie du système

### Chat Operations
- `POST /api/chat` - Endpoint chat legacy
- `POST /api/chat/completions` - Chat OpenAI-compatible (SillyTavern & ChatUI)
- `GET /api/models` - Lister les modèles disponibles

### Configuration Intelligence
- `POST /api/config/generate` - Générer configuration intelligente
- `POST /api/config/generate-with-fresh` - Configuration avec versions fraîches
- `POST /api/config/sources/search` - Rechercher packages multi-registres
- `GET /api/config/sources/status` - Statut des sources

### Self-Awareness
- `GET /api/self-awareness/status` - État de self-awareness
- `POST /api/self-awareness/analyze` - Analyser système génétique
- `GET /api/self-awareness/genetic-code` - Code génétique actuel
- `POST /api/self-awareness/evolve` - Faire évoluer le système

### WebSocket AG-UI

Connexion: `ws://localhost:3000/ws`

#### Event Types

**Client → Server:**
```javascript
// Chat message
{
  "type": "chat",
  "content": {
    "text": "Create a file processing agent"
  }
}

// Command
{
  "type": "command", 
  "content": {
    "command": "system-health"
  }
}

// Input form submission
{
  "type": "input",
  "content": {
    "action": "create-agent",
    "values": {
      "description": "File processor",
      "tools": ["file-system"]
    }
  }
}
```

**Server → Client:**
```javascript
// Display events (tables, forms, metrics)
{
  "type": "display",
  "template": "table",
  "data": {
    "headers": ["Name", "Status"],
    "rows": [["agent-1", "active"]]
  }
}

// Status updates
{
  "type": "status",
  "level": "success",
  "message": "Agent created successfully"
}

// Chat responses
{
  "type": "chat",
  "content": {
    "text": "I've created the agent...",
    "agent": "assistant"
  }
}
```

## Extension SillyTavern

L'extension SillyTavern (565 lignes) permet:
- Création d'agents via chat naturel
- Monitoring en temps réel
- Gestion mémoire hybride
- Intégration WebSocket AG-UI

### Installation Extension

```bash
# Copier vers SillyTavern
cp extensions/sillytavern/* /path/to/SillyTavern/public/scripts/extensions/autoweave/
```

### Configuration Extension

```json
{
  "name": "AutoWeave Integration",
  "version": "1.0.0",
  "apiEndpoint": "http://localhost:3000",
  "websocketUrl": "ws://localhost:3000/ws",
  "features": {
    "agentCreation": true,
    "memorySearch": true,
    "realtimeMonitoring": true,
    "agui": true
  }
}
```

## Usage

### Standalone Server

```javascript
import express from 'express';
import { setupRoutes } from '@autoweave/ui/routes';

const app = express();
setupRoutes(app);

app.listen(3000, () => {
  console.log('AutoWeave UI running on port 3000');
});
```

### Intégration Chat-UI

```typescript
import { AutoWeaveAdapter } from '@autoweave/ui/lib/autoweave-adapter';

const adapter = new AutoWeaveAdapter({
  apiUrl: 'http://localhost:3000',
  wsUrl: 'ws://localhost:3000/ws'
});

// Utiliser dans les composants Svelte
adapter.createAgent(description);
adapter.searchMemory(query);
```

## Développement

```bash
# Mode développement avec hot-reload
npm run dev

# Tests
npm test

# Build production
npm run build
```

## Architecture AG-UI

Le système AG-UI (Agent-GUI) utilise:
- WebSocket bidirectionnel pour communication temps réel
- Template engine pour génération UI dynamique
- Event-driven architecture pour réactivité
- Session management pour multi-clients

## Dépendances Principales

- `express`: Framework web
- `ws`: WebSocket server
- `joi`: Validation des données
- `uuid`: Génération d'identifiants
- `cors`: Support CORS
- `express-rate-limit`: Protection rate limiting

## License

MIT