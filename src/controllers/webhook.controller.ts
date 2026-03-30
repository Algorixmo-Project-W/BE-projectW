import { Request, Response } from 'express';
import { WebhookService } from '../services/webhook.service.js';
import { UserService } from '../services/user.service.js';
import { MessageService } from '../services/message.service.js';
import { CampaignService } from '../services/campaign.service.js';
import { WhatsAppService } from '../services/whatsapp.service.js';
import { AiAgentService } from '../services/ai-agent.service.js';
import { AiIntegrationService } from '../services/ai-integration.service.js';
import { ContactService } from '../services/contact.service.js';

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
      
      // Generate callback URL (dynamic URL with userId)
      const callbackUrl = WebhookService.generateCallbackUrl(baseUrl, userId);

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
   * WhatsApp webhook verification endpoint (Dynamic URL with userId)
   * GET /api/webhook/:userId
   * 
   * Each user gets their own webhook URL
   * This works better for multi-tenant setups where each user configures their own webhook
   */
  static async verifyWebhookByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const mode = req.query['hub.mode'] as string;
      const token = req.query['hub.verify_token'] as string;
      const challenge = req.query['hub.challenge'] as string;

      if (mode !== 'subscribe') return res.sendStatus(403);

      const webhook = await WebhookService.findByUserId(userId);
      if (!webhook || !webhook.isActive) return res.sendStatus(403);

      if (token !== webhook.verifyToken) return res.sendStatus(403);

      return res.status(200).send(challenge);
    } catch (error) {
      console.error('Error verifying webhook:', error);
      return res.sendStatus(500);
    }
  }

  /**
   * WhatsApp webhook message handler (Dynamic URL with userId)
   * POST /api/webhook/:userId
   * 
   * Alternative approach: Each user gets their own webhook URL
   */
  static async handleWebhookByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const body = req.body;

      console.log(`\n[Webhook] Incoming WhatsApp payload for userId: ${userId}`);
      console.log(JSON.stringify(body, null, 2));
      console.log('--------------------------------------------------\n');

      // Verify webhook exists and is active
      const webhook = await WebhookService.findByUserId(userId);
      if (!webhook || !webhook.isActive) return res.sendStatus(403);

      if (!body.object) return res.sendStatus(400);
      if (body.object !== 'whatsapp_business_account') return res.sendStatus(200);

      // Process entries
      if (body.entry && Array.isArray(body.entry)) {
        for (const entry of body.entry) {
          if (entry.changes && Array.isArray(entry.changes)) {
            for (const change of entry.changes) {
              const field = change.field;
              const value = change.value;

              if (field === 'messages') {
                if (value.messages && Array.isArray(value.messages)) {
                  for (const message of value.messages) {
                    // Extract message content based on type
                    let messageContent = '';
                    if (message.type === 'text' && message.text) {
                      messageContent = message.text.body;
                    } else if (message.type === 'image' && message.image) {
                      messageContent = message.image.caption || '[Image]';
                    } else if (message.type === 'document' && message.document) {
                      messageContent = message.document.caption || '[Document]';
                    } else if (message.type === 'audio') {
                      messageContent = '[Audio]';
                    } else if (message.type === 'video' && message.video) {
                      messageContent = message.video.caption || '[Video]';
                    } else if (message.type === 'sticker') {
                      messageContent = '[Sticker]';
                    } else if (message.type === 'location' && message.location) {
                      messageContent = `[Location: ${message.location.latitude}, ${message.location.longitude}]`;
                    } else if (message.type === 'contacts') {
                      messageContent = '[Contact]';
                    } else {
                      messageContent = `[${message.type}]`;
                    }

                    // Save message to database
                    try {
                      // Extract name and upsert contact
                      const rawContactName = change.value.contacts?.[0]?.profile?.name;
                      const customerName = rawContactName && rawContactName.length > 0 ? rawContactName : null;
                      if (customerName) {
                        try {
                          await ContactService.upsert(userId, message.from, customerName);
                        } catch (contactErr) {
                          console.error('Failed to upsert contact:', contactErr);
                        }
                      }

                      const activeCampaign = await CampaignService.findActiveByUserId(userId);
                      if (!activeCampaign) continue;

                      let replyStatus: 'pending' | 'sent' | 'failed' = 'pending';
                      let replyMessageId: string | null = null;
                      let replyContent: string | null = null;

                      const replyType = (activeCampaign.replyType || 'text') as 'text' | 'image' | 'ai';

                      if (replyType === 'ai' && activeCampaign.aiAgentId) {
                        try {
                          const agent = await AiAgentService.findById(activeCampaign.aiAgentId);
                          if (!agent) {
                            replyStatus = 'failed';
                          } else {
                            const historyLimit = parseInt(process.env.AI_HISTORY_MESSAGES || '5', 10);
                            const threadHistory = await MessageService.getThreadHistory(activeCampaign.id, message.from);
                            const priorMessages = threadHistory.slice(-historyLimit);

                            // Only pass custom name if there's no prior history (first message greeting)
                            const passCustomerName = threadHistory.length === 0 ? customerName : null;

                            const integrations = await AiIntegrationService.findByAgentId(agent.id);
                            replyContent = await AiAgentService.generateReply(
                              agent,
                              messageContent,
                              priorMessages,
                              integrations,
                              passCustomerName
                            );

                            const sendResult = await WhatsAppService.sendTextMessage(userId, message.from, replyContent);
                            if (sendResult.success) {
                              replyStatus = 'sent';
                              replyMessageId = sendResult.messageId || null;
                              await CampaignService.incrementMessageCount(activeCampaign.id);
                            } else {
                              console.error('Failed to send AI reply:', sendResult.error);
                              replyStatus = 'failed';
                            }
                          }
                        } catch (aiError: any) {
                          console.error('AI generation failed:', aiError.message);
                          replyStatus = 'failed';
                        }
                      } else if (activeCampaign.fixedReply) {
                        replyContent = replyType === 'image' && activeCampaign.replyImageUrl
                          ? `[Image: ${activeCampaign.replyImageUrl}] ${activeCampaign.fixedReply}`
                          : activeCampaign.fixedReply;

                        const sendResult = await WhatsAppService.sendReply(
                          userId,
                          message.from,
                          replyType as 'text' | 'image',
                          activeCampaign.fixedReply,
                          activeCampaign.replyImageUrl
                        );

                        if (sendResult.success) {
                          replyStatus = 'sent';
                          replyMessageId = sendResult.messageId || null;
                          await CampaignService.incrementMessageCount(activeCampaign.id);
                        } else {
                          console.error('Failed to send auto-reply:', sendResult.error);
                          replyStatus = 'failed';
                        }
                      }

                      await MessageService.create({
                        userId,
                        campaignId: activeCampaign.id,
                        senderNumber: message.from,
                        messageType: message.type,
                        messageContent,
                        replyContent,
                        replyStatus,
                        whatsappMessageId: message.id,
                        replyMessageId,
                        receivedAt: new Date(parseInt(message.timestamp) * 1000)
                      });

                    } catch (dbError) {
                      console.error('Failed to process message:', dbError);
                    }
                  }
                }
              }
            }
          }
        }
      }

      return res.sendStatus(200);
    } catch (error) {
      console.error('Error handling webhook:', error);
      return res.sendStatus(200);
    }
  }
}
