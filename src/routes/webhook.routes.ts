import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller.js';

const router = Router();

// Generate webhook configuration for a user
router.post('/generate', WebhookController.generateWebhook);

// Regenerate verify token
router.post('/regenerate/:id', WebhookController.regenerateToken);

// Get webhook configuration by user ID
router.get('/user/:userId', WebhookController.getByUserId);

// Delete webhook configuration
router.delete('/:id', WebhookController.deleteWebhook);

// WhatsApp webhook verification and message handler
router.get('/:userId', WebhookController.verifyWebhook);
router.post('/:userId', WebhookController.handleWebhook);

export default router;
