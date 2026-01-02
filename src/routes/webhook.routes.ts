import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller.js';

const router = Router();

// Generate webhook configuration for a user
router.post('/generate', WebhookController.generateWebhook);

// Regenerate verify token
router.post('/regenerate/:id', WebhookController.regenerateToken);

// Get webhook configuration by user ID
router.get('/config/:userId', WebhookController.getByUserId);

// Delete webhook configuration
router.delete('/config/:id', WebhookController.deleteWebhook);

// WhatsApp webhook endpoints - DYNAMIC URL (per-user webhooks)
// Users configure: https://your-domain.com/api/webhook/:userId
router.get('/:userId', WebhookController.verifyWebhookByUserId);
router.post('/:userId', WebhookController.handleWebhookByUserId);

export default router;
