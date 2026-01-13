import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';

const router = Router();

// Get all users
router.get('/', UserController.getAll);

// Get user by ID
router.get('/:id', UserController.getById);

// Create new user
router.post('/create', UserController.create);

// Login user
router.post('/login', UserController.login);

// Update user
router.put('/:id', UserController.update);

// Delete user
router.delete('/:id', UserController.delete);

export default router;
