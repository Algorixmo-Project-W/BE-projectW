import { Router } from 'express';
import { AiAgentController } from '../controllers/ai-agent.controller.js';
import { AiIntegrationController } from '../controllers/ai-integration.controller.js';

const router = Router();

// Create AI agent
router.post('/', AiAgentController.create);

// Get all AI agents for a user
router.get('/user/:userId', AiAgentController.getByUserId);

// Get AI agent by ID
router.get('/:id', AiAgentController.getById);

// Update AI agent
router.put('/:id', AiAgentController.update);

// Delete AI agent
router.delete('/:id', AiAgentController.delete);

// --- Integrations (meeting links) ---
// GET  /api/ai-agents/:agentId/integrations
router.get('/:agentId/integrations', AiIntegrationController.getByAgentId);

// PUT  /api/ai-agents/:agentId/integrations  { zoom, hubspot, google }
router.put('/:agentId/integrations', AiIntegrationController.upsert);

// DELETE /api/ai-agents/:agentId/integrations
router.delete('/:agentId/integrations', AiIntegrationController.delete);

export default router;
