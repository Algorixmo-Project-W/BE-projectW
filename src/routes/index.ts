import { Router } from 'express';
import healthRoutes from './health.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

// Mount routes
router.use('/api', healthRoutes);
router.use('/api/users', userRoutes);

export default router;
