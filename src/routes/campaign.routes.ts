import { Router } from 'express';
import { CampaignController } from '../controllers/campaign.controller.js';

const router = Router();

// Get campaigns for a user
router.get('/user/:userId', CampaignController.getByUserId);

// Get campaign by ID
router.get('/:id', CampaignController.getById);

// Create new campaign
router.post('/', CampaignController.create);

// Update campaign
router.put('/:id', CampaignController.update);

// Delete campaign
router.delete('/:id', CampaignController.delete);

export default router;
