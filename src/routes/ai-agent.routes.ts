import { Router } from 'express';
import { AiAgentController } from '../controllers/ai-agent.controller.js';

const router = Router();

// Create AI agent
// POST /api/ai-agents
router.post('/', AiAgentController.create);

// Get all AI agents for a user
// GET /api/ai-agents/user/:userId
router.get('/user/:userId', AiAgentController.getByUserId);

// Get AI agent by ID
// GET /api/ai-agents/:id
router.get('/:id', AiAgentController.getById);

// Update AI agent
// PUT /api/ai-agents/:id
router.put('/:id', AiAgentController.update);

// Delete AI agent
// DELETE /api/ai-agents/:id
router.delete('/:id', AiAgentController.delete);

export default router;
