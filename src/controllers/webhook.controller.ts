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
      
      // Generate callback URL (fixed URL for Meta - no user ID)
      const callbackUrl = WebhookService.generateCallbackUrl(baseUrl);

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
   * GET /api/webhook/config/:userId
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
   * DELETE /api/webhook/config/:id
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
   * GET /api/webhook/whatsapp
   * 
   * Meta sends: GET /whatsapp?hub.mode=subscribe&hub.verify_token=TOKEN&hub.challenge=CHALLENGE
   * Must respond with: Plain text challenge string with 200 status
   */
  static async verifyWebhook(req: Request, res: Response) {
    try {
      const mode = req.query['hub.mode'] as string;
      const token = req.query['hub.verify_token'] as string;
      const challenge = req.query['hub.challenge'] as string;

      console.log('🔍 Webhook verification request:', {
        mode,
        hasToken: !!token,
        hasChallenge: !!challenge
      });

      // Verify this is a subscribe request
      if (mode !== 'subscribe') {
        console.error('❌ Invalid hub.mode:', mode);
        return res.sendStatus(403);
      }

      // Find webhook configuration by verify token
      // Since we don't have userId in URL, we need to find by token
      const webhook = await WebhookService.findByVerifyToken(token);
      
      if (!webhook) {
        console.error('❌ Webhook config not found for token');
        return res.sendStatus(403);
      }

      if (!webhook.isActive) {
        console.error('❌ Webhook is not active');
        return res.sendStatus(403);
      }

      console.log('✅ Webhook verified successfully for user:', webhook.userId);
      // IMPORTANT: Must return challenge as plain text, not JSON
      return res.status(200).send(challenge);
    } catch (error) {
      console.error('❌ Error verifying webhook:', error);
      return res.sendStatus(500);
    }
  }

  /**
   * WhatsApp webhook message handler
   * POST /api/webhook/whatsapp
   * 
   * Receives JSON payloads from WhatsApp for:
   * - Incoming messages
   * - Message status updates
   * - Other notifications
   * 
   * Must respond with 200 status to acknowledge receipt
   */
  static async handleWebhook(req: Request, res: Response) {
    try {
      const body = req.body;

      console.log('🔥 WEBHOOK EVENT FIELDS 🔥');
      console.log(
        req.body.entry?.[0]?.changes?.[0]?.field
      );

      console.log('📨 Incoming WhatsApp webhook');
      console.log('Payload:', JSON.stringify(body, null, 2));

      // Validate webhook payload structure
      if (!body.object) {
        console.error('❌ Invalid webhook payload - missing object field');
        return res.sendStatus(400);
      }

      // Check if this is a WhatsApp Business Account webhook
      if (body.object !== 'whatsapp_business_account') {
        console.log('⚠️  Unknown webhook object type:', body.object);
        return res.sendStatus(200); // Still acknowledge
      }

      // Extract phone number ID to identify which user/business this belongs to
      let phoneNumberId: string | null = null;

      // Process entries
      if (body.entry && Array.isArray(body.entry)) {
        for (const entry of body.entry) {
          if (entry.changes && Array.isArray(entry.changes)) {
            for (const change of entry.changes) {
              const field = change.field;
              const value = change.value;

              // Extract phone number ID from metadata
              if (value.metadata && value.metadata.phone_number_id) {
                phoneNumberId = value.metadata.phone_number_id;
                console.log('📞 Phone number ID:', phoneNumberId);
                
                // TODO: Find user by phone number ID from wa_credentials table
                // For now, we'll just log it
              }

              console.log(`📬 Processing ${field} change`);

              // Handle different types of changes
              if (field === 'messages') {
                // Handle incoming messages
                if (value.messages && Array.isArray(value.messages)) {
                  for (const message of value.messages) {
                    console.log('💬 New message:', {
                      from: message.from,
                      id: message.id,
                      type: message.type,
                      timestamp: message.timestamp,
                      phoneNumberId
                    });
                    
                    // TODO: 
                    // 1. Find user by phoneNumberId from wa_credentials table
                    // 2. Store message in database
                    // 3. Check for campaign matches for that user
                    // 4. Send auto-reply if needed
                  }
                }

                // Handle message statuses
                if (value.statuses && Array.isArray(value.statuses)) {
                  for (const status of value.statuses) {
                    console.log('📊 Message status update:', {
                      id: status.id,
                      status: status.status,
                      timestamp: status.timestamp,
                      phoneNumberId
                    });
                    
                    // TODO: Update message status in database
                  }
                }
              } else {
                console.log('ℹ️  Unhandled field type:', field);
              }
            }
          }
        }
      }

      // IMPORTANT: Always return 200 to acknowledge receipt
      // If you don't respond with 200, WhatsApp will retry the webhook
      return res.sendStatus(200);
    } catch (error) {
      console.error('❌ Error handling webhook:', error);
      // Still return 200 to prevent retries for application errors
      return res.sendStatus(200);
    }
  }
}
