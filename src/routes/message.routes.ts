import { Router } from 'express';
import { MessageController } from '../controllers/message.controller.js';

const router = Router();

// Get messages for a user
router.get('/user/:userId', MessageController.getByUserId);

// Get messages by campaign
router.get('/campaign/:campaignId', MessageController.getByCampaignId);

// Get message by ID
router.get('/:id', MessageController.getById);

// Create new message
router.post('/', MessageController.create);

// Delete message
router.delete('/:id', MessageController.delete);

export default router;
