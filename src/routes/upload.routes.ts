import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller.js';

const router = Router();

// Upload an image
// POST /api/uploads
router.post('/', UploadController.upload);

// Get all uploads for a user
// GET /api/uploads/user/:userId
router.get('/user/:userId', UploadController.getByUserId);

// Serve image file (PUBLIC)
// GET /api/uploads/:id/file
router.get('/:id/file', UploadController.serveFile);

// Delete an upload
// DELETE /api/uploads/:id
router.delete('/:id', UploadController.delete);

export default router;
