import { Router } from 'express';
import { WaCredentialController } from '../controllers/wa-credential.controller.js';

const router = Router();

// Add WhatsApp credentials
router.post('/add', WaCredentialController.add);

// Get user's WhatsApp credentials
router.get('/user/:userId', WaCredentialController.getByUserId);

// Update WhatsApp credentials
router.put('/:id', WaCredentialController.update);

// Delete WhatsApp credentials
router.delete('/:id', WaCredentialController.delete);

export default router;
