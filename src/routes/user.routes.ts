import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';

const router = Router();

// Create new user
router.post('/create', UserController.create);

// Login user
router.post('/login', UserController.login);

export default router;
