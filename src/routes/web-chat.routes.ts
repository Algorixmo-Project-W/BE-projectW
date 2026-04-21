import { Router } from 'express';
import { WebChatController } from '../controllers/web-chat.controller.js';

const router = Router();

router.get('/:campaignId', WebChatController.getCampaignInfo);
router.post('/:campaignId/start', WebChatController.startSession);
router.post('/:campaignId/message', WebChatController.sendMessage);
router.get('/:campaignId/history', WebChatController.getHistory);

export default router;
