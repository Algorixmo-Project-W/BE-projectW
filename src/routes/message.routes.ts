import { Router } from 'express';
import { MessageController } from '../controllers/message.controller.js';

const router = Router();

// Get messages for a user
router.get('/user/:userId', MessageController.getByUserId);

// Get messages by campaign
router.get('/campaign/:campaignId', MessageController.getByCampaignId);

// Get all threads (unique senders) for a campaign
router.get('/threads/:campaignId', MessageController.getThreadsByCampaign);

// Get all direct (no-campaign) threads for a user
router.get('/threads/user/:userId', MessageController.getThreadsByUser);

// Get full chat history for a specific (campaign, senderNumber) thread
router.get('/thread/:campaignId/:senderNumber', MessageController.getThreadHistory);

// Get full chat history for a direct (userId, senderNumber) thread
router.get('/thread/user/:userId/:senderNumber', MessageController.getThreadByUser);

// Get message by ID
router.get('/:id', MessageController.getById);

// Send a manual reply in a direct WhatsApp thread
router.post('/send/direct', MessageController.sendDirect);

// Create new message
router.post('/', MessageController.create);

// Delete message
router.delete('/:id', MessageController.delete);

export default router;
