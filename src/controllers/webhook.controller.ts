import { Request, Response } from 'express';
import { WebhookService } from '../services/webhook.service.js';
import { UserService } from '../services/user.service.js';

export class WebhookController {
  /**
   * Generate webhook configuration for a user
   * POST /api/webhook/generate
   */
  static async generateWebhook(req: Request, res: Response) {
    try {
      const { userId } = req.body;

      // Validate required fields
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
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

      // Check if user already has a webhook config
      const existingWebhook = await WebhookService.findByUserId(userId);
      if (existingWebhook) {
        return res.status(409).json({
          success: false,
          message: 'Webhook configuration already exists for this user. Use regenerate endpoint to create a new token.',
          data: {
            id: existingWebhook.id,
            callbackUrl: existingWebhook.callbackUrl,
            verifyToken: existingWebhook.verifyToken,
            isActive: existingWebhook.isActive
          }
        });
      }

      // Generate verify token
      const verifyToken = WebhookService.generateVerifyToken();

      // Get base URL from environment
      const baseUrl = process.env.BASE_URL;
      
      if (!baseUrl) {
        return res.status(500).json({
          success: false,
          message: 'BASE_URL is not configured in environment variables'
        });
      }
      
      // Generate callback URL
      const callbackUrl = WebhookService.generateCallbackUrl(userId, baseUrl);

      // Create webhook config
      const webhookConfig = await WebhookService.create({
        userId,
        callbackUrl,
        verifyToken,
        isActive: true
      });

      return res.status(201).json({
        success: true,
        message: 'Webhook configuration generated successfully',
        data: {
          id: webhookConfig.id,
          callbackUrl: webhookConfig.callbackUrl,
          verifyToken: webhookConfig.verifyToken,
          isActive: webhookConfig.isActive,
          createdAt: webhookConfig.createdAt
        }
      });
    } catch (error) {
      console.error('Error generating webhook:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Regenerate verify token for a webhook
   * POST /api/webhook/regenerate/:id
   */
  static async regenerateToken(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Webhook ID is required'
        });
      }

      // Check if webhook exists
      const existingWebhook = await WebhookService.findById(id);
      if (!existingWebhook) {
        return res.status(404).json({
          success: false,
          message: 'Webhook configuration not found'
        });
      }

      // Regenerate token
      const updatedWebhook = await WebhookService.regenerateToken(id);

      return res.status(200).json({
        success: true,
        message: 'Verify token regenerated successfully',
        data: {
          id: updatedWebhook.id,
          callbackUrl: updatedWebhook.callbackUrl,
          verifyToken: updatedWebhook.verifyToken,
          isActive: updatedWebhook.isActive
        }
      });
    } catch (error) {
      console.error('Error regenerating token:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get webhook configuration by user ID
   * GET /api/webhook/user/:userId
   */
  static async getByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const webhook = await WebhookService.findByUserId(userId);

      if (!webhook) {
        return res.status(404).json({
          success: false,
          message: 'Webhook configuration not found for this user'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Webhook configuration retrieved successfully',
        data: webhook
      });
    } catch (error) {
      console.error('Error retrieving webhook:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Delete webhook configuration
   * DELETE /api/webhook/:id
   */
  static async deleteWebhook(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Webhook ID is required'
        });
      }

      // Check if webhook exists
      const existingWebhook = await WebhookService.findById(id);
      if (!existingWebhook) {
        return res.status(404).json({
          success: false,
          message: 'Webhook configuration not found'
        });
      }

      await WebhookService.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Webhook configuration deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting webhook:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * WhatsApp webhook verification endpoint
   * GET /api/webhook/:userId
   */
  static async verifyWebhook(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      // Check if this is a webhook verification request
      if (mode === 'subscribe') {
        // Find webhook config for this user
        const webhook = await WebhookService.findByUserId(userId);

        if (!webhook) {
          console.error('Webhook config not found for user:', userId);
          return res.status(404).send('Webhook not found');
        }

        // Verify the token matches
        if (token === webhook.verifyToken) {
          console.log('✅ Webhook verified successfully for user:', userId);
          return res.status(200).send(challenge);
        } else {
          console.error('❌ Webhook verification failed - token mismatch');
          return res.status(403).send('Forbidden');
        }
      }

      return res.status(400).send('Bad Request');
    } catch (error) {
      console.error('Error verifying webhook:', error);
      return res.status(500).send('Internal Server Error');
    }
  }

  /**
   * WhatsApp webhook message handler
   * POST /api/webhook/:userId
   */
  static async handleWebhook(req: Request, res: Response) {
    try {
        console.log('Received webhook request');
      const { userId } = req.params;
      const body = req.body;

      // Verify webhook exists and is active
      const webhook = await WebhookService.findByUserId(userId);

      if (!webhook) {
        console.error('Webhook config not found for user:', userId);
        return res.status(404).json({
          success: false,
          message: 'Webhook not found'
        });
      }

      if (!webhook.isActive) {
        console.error('Webhook is not active for user:', userId);
        return res.status(403).json({
          success: false,
          message: 'Webhook is not active'
        });
      }

      // Log the incoming webhook data
      console.log('📨 Incoming WhatsApp webhook for user:', userId);
      console.log('Webhook data:', JSON.stringify(body, null, 2));

      // TODO: Process the webhook data (messages, status updates, etc.)
      // This is where you'll add logic to:
      // 1. Parse the incoming message
      // 2. Store it in the database
      // 3. Trigger auto-reply campaigns
      // 4. Send responses back to WhatsApp

      // Acknowledge receipt
      return res.status(200).json({
        success: true,
        message: 'Webhook received'
      });
    } catch (error) {
      console.error('Error handling webhook:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
