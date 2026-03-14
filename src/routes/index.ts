import { Router } from 'express';
import healthRoutes from './health.routes.js';
import userRoutes from './user.routes.js';
import waCredentialRoutes from './wa-credential.routes.js';
import webhookRoutes from './webhook.routes.js';
import campaignRoutes from './campaign.routes.js';
import messageRoutes from './message.routes.js';
import uploadRoutes from './upload.routes.js';
import aiAgentRoutes from './ai-agent.routes.js';

const router = Router();

// Mount routes
router.use('/api', healthRoutes);
router.use('/api/users', userRoutes);
router.use('/api/wa-credentials', waCredentialRoutes);
router.use('/api/webhook', webhookRoutes);
router.use('/api/campaigns', campaignRoutes);
router.use('/api/messages', messageRoutes);
router.use('/api/uploads', uploadRoutes);
router.use('/api/ai-agents', aiAgentRoutes);

export default router;
