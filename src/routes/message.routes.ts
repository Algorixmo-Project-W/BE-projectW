import { Router } from 'express';
import { MessageController } from '../controllers/message.controller.js';

const router = Router();

// Get messages for a user
router.get('/user/:userId', MessageController.getByUserId);

// Get messages by campaign
router.get('/campaign/:campaignId', MessageController.getByCampaignId);

// Get all threads (unique senders) for a campaign
router.get('/threads/:campaignId', MessageController.getThreadsByCampaign);

// Get full chat history for a specific (campaign, senderNumber) thread
router.get('/thread/:campaignId/:senderNumber', MessageController.getThreadHistory);

// Get message by ID
router.get('/:id', MessageController.getById);

// Create new message
router.post('/', MessageController.create);

// Delete message
router.delete('/:id', MessageController.delete);

export default router;
