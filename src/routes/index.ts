import { Router } from 'express';
import healthRoutes from './health.routes.js';
import userRoutes from './user.routes.js';
import waCredentialRoutes from './wa-credential.routes.js';

const router = Router();

// Mount routes
router.use('/api', healthRoutes);
router.use('/api/users', userRoutes);
router.use('/api/wa-credentials', waCredentialRoutes);

export default router;
