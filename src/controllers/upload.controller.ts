import { Request, Response } from 'express';
import { UploadService } from '../services/upload.service.js';
import { UserService } from '../services/user.service.js';

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export class UploadController {
  /**
   * Upload an image
   * POST /api/uploads
   * Body: { userId, fileName, mimeType, fileData (base64) }
   */
  static async upload(req: Request, res: Response) {
    try {
      const { userId, fileName, mimeType, fileData } = req.body;

      // Validate required fields
      if (!userId || !fileName || !mimeType || !fileData) {
        return res.status(400).json({
          success: false,
          message: 'userId, fileName, mimeType, and fileData are required'
        });
      }

      // Validate user exists
      const user = await UserService.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Validate mime type
      if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`
        });
      }

      // Calculate file size from base64
      const base64Data = fileData.replace(/^data:image\/\w+;base64,/, '');
      const fileSize = Buffer.from(base64Data, 'base64').length;

      // Validate file size
      if (fileSize > MAX_FILE_SIZE) {
        return res.status(400).json({
          success: false,
          message: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
        });
      }

      // Create upload record
      const upload = await UploadService.create({
        userId,
        fileName,
        mimeType,
        fileSize,
        fileData: base64Data
      });

      // Generate public URL
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
      const publicUrl = UploadService.getPublicUrl(upload.id, baseUrl);

      return res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          id: upload.id,
          fileName: upload.fileName,
          mimeType: upload.mimeType,
          fileSize: upload.fileSize,
          url: publicUrl,
          createdAt: upload.createdAt
        }
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get all uploads for a user
   * GET /api/uploads/user/:userId
   */
  static async getByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const uploads = await UploadService.findByUserId(userId);
      
      // Add public URLs to each upload
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
      const uploadsWithUrls = uploads.map(upload => ({
        ...upload,
        url: UploadService.getPublicUrl(upload.id, baseUrl)
      }));

      return res.status(200).json({
        success: true,
        data: uploadsWithUrls
      });
    } catch (error) {
      console.error('Error getting uploads:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Serve image file (PUBLIC - no auth required)
   * GET /api/uploads/:id/file
   */
  static async serveFile(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const upload = await UploadService.findById(id);
      if (!upload) {
        return res.status(404).json({
          success: false,
          message: 'Image not found'
        });
      }

      // Convert base64 to buffer
      const imageBuffer = Buffer.from(upload.fileData, 'base64');

      // Set headers and send image
      res.set({
        'Content-Type': upload.mimeType,
        'Content-Length': imageBuffer.length,
        'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
      });

      return res.send(imageBuffer);
    } catch (error) {
      console.error('Error serving file:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Delete an upload
   * DELETE /api/uploads/:id
   */
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const upload = await UploadService.findById(id);
      if (!upload) {
        return res.status(404).json({
          success: false,
          message: 'Upload not found'
        });
      }

      await UploadService.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Upload deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting upload:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
