import { Request, Response } from 'express';
import { WebhookService } from '../services/webhook.service.js';
import { UserService } from '../services/user.service.js';
import { MessageService } from '../services/message.service.js';
import { CampaignService } from '../services/campaign.service.js';
import { WhatsAppService } from '../services/whatsapp.service.js';
import { AiAgentService } from '../services/ai-agent.service.js';

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

      console.log('🔍 Webhook verification request (dynamic URL):', {
        userId,
        mode,
        hasToken: !!token,
        hasChallenge: !!challenge
      });

      // Verify this is a subscribe request
      if (mode !== 'subscribe') {
        console.error('❌ Invalid hub.mode:', mode);
        return res.sendStatus(403);
      }

      // Find webhook configuration for this user
      const webhook = await WebhookService.findByUserId(userId);
      
      if (!webhook) {
        console.error('❌ Webhook config not found for user:', userId);
        return res.sendStatus(403);
      }

      if (!webhook.isActive) {
        console.error('❌ Webhook is not active for user:', userId);
        return res.sendStatus(403);
      }

      // Verify token matches
      if (token !== webhook.verifyToken) {
        console.error('❌ Token mismatch for user:', userId);
        return res.sendStatus(403);
      }

      console.log('✅ Webhook verified successfully for user:', userId);
      return res.status(200).send(challenge);
    } catch (error) {
      console.error('❌ Error verifying webhook:', error);
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

      console.log('📨 Incoming WhatsApp webhook (dynamic URL) for user:', userId);
      console.log('🔥 WEBHOOK EVENT FIELDS 🔥');
      console.log(req.body.entry?.[0]?.changes?.[0]?.field);

      // Verify webhook exists and is active
      const webhook = await WebhookService.findByUserId(userId);
      if (!webhook) {
        console.error('❌ Webhook config not found for user:', userId);
        return res.sendStatus(403);
      }

      if (!webhook.isActive) {
        console.error('❌ Webhook is not active for user:', userId);
        return res.sendStatus(403);
      }

      console.log('Payload:', JSON.stringify(body, null, 2));

      // Validate webhook payload structure
      if (!body.object) {
        console.error('❌ Invalid webhook payload - missing object field');
        return res.sendStatus(400);
      }

      if (body.object !== 'whatsapp_business_account') {
        console.log('⚠️  Unknown webhook object type:', body.object);
        return res.sendStatus(200);
      }

      // Extract phone number ID
      let phoneNumberId: string | null = null;

      // Process entries
      if (body.entry && Array.isArray(body.entry)) {
        for (const entry of body.entry) {
          if (entry.changes && Array.isArray(entry.changes)) {
            for (const change of entry.changes) {
              const field = change.field;
              const value = change.value;

              if (value.metadata && value.metadata.phone_number_id) {
                phoneNumberId = value.metadata.phone_number_id;
                console.log('📞 Phone number ID:', phoneNumberId);
              }

              console.log(`📬 Processing ${field} change for user:`, userId);

              if (field === 'messages') {
                if (value.messages && Array.isArray(value.messages)) {
                  for (const message of value.messages) {
                    console.log('💬 New message:', {
                      userId,
                      from: message.from,
                      id: message.id,
                      type: message.type,
                      timestamp: message.timestamp,
                      phoneNumberId
                    });
                    
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
                      // Check if user has an active campaign
                      const activeCampaign = await CampaignService.findActiveByUserId(userId);
                      
                      if (!activeCampaign) {
                        console.log('⚠️  No active campaign for user:', userId, '- Message not saved');
                        continue; // Skip saving and replying if no active campaign
                      }

                      console.log('✅ Active campaign found:', activeCampaign.name);

                      // Send auto-reply first, then save with result
                      let replyStatus: 'pending' | 'sent' | 'failed' = 'pending';
                      let replyMessageId: string | null = null;
                      let replyContent: string | null = null;

                      const replyType = (activeCampaign.replyType || 'text') as 'text' | 'image' | 'ai';

                      if (replyType === 'ai' && activeCampaign.aiAgentId) {
                        // AI-powered reply
                        console.log('🤖 Generating AI reply for:', message.from);
                        try {
                          const agent = await AiAgentService.findById(activeCampaign.aiAgentId);
                          if (agent) {
                            // Fetch recent conversation history for this sender
                            const historyLimit = parseInt(process.env.AI_HISTORY_MESSAGES!,10);
                            const threadHistory = await MessageService.getThreadHistory(
                              activeCampaign.id,
                              message.from
                            );
                            // Take the last N messages (oldest-first slice)
                            const priorMessages = threadHistory.slice(-historyLimit);
                            console.log(`🤖 Using ${priorMessages.length} prior messages as context`);

                            replyContent = await AiAgentService.generateReply(agent, messageContent, priorMessages);
                            console.log('🤖 AI reply generated:', replyContent);

                            const sendResult = await WhatsAppService.sendTextMessage(userId, message.from, replyContent);
                            if (sendResult.success) {
                              replyStatus = 'sent';
                              replyMessageId = sendResult.messageId || null;
                              await CampaignService.incrementMessageCount(activeCampaign.id);
                            } else {
                              console.error('❌ Failed to send AI reply:', sendResult.error);
                              replyStatus = 'failed';
                            }
                          } else {
                            console.error('❌ AI agent not found:', activeCampaign.aiAgentId);
                            replyStatus = 'failed';
                          }
                        } catch (aiError: any) {
                          console.error('❌ AI generation failed:', aiError.message);
                          replyStatus = 'failed';
                        }
                      } else if (activeCampaign.fixedReply) {
                        // Fixed text or image reply
                        console.log('📤 Sending auto-reply (' + replyType + ') to:', message.from);

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
                          console.log('✅ Auto-reply sent successfully, messageId:', sendResult.messageId);
                          replyStatus = 'sent';
                          replyMessageId = sendResult.messageId || null;
                          await CampaignService.incrementMessageCount(activeCampaign.id);
                        } else {
                          console.error('❌ Failed to send auto-reply:', sendResult.error);
                          replyStatus = 'failed';
                        }
                      } else {
                        console.log('⚠️  Campaign has no reply configured');
                      }

                      // Save single message record with incoming message + reply info
                      const savedMessage = await MessageService.create({
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
                      console.log('✅ Message saved to database:', savedMessage.id, '| Reply status:', replyStatus);

                    } catch (dbError) {
                      console.error('❌ Failed to process message:', dbError);
                    }
                  }
                }

                if (value.statuses && Array.isArray(value.statuses)) {
                  for (const status of value.statuses) {
                    console.log('📊 Message status update:', {
                      userId,
                      id: status.id,
                      status: status.status,
                      timestamp: status.timestamp,
                      phoneNumberId
                    });
                    
                    // TODO: Update message status in database for this user
                  }
                }
              } else {
                console.log('ℹ️  Unhandled field type:', field);
              }
            }
          }
        }
      }

      return res.sendStatus(200);
    } catch (error) {
      console.error('❌ Error handling webhook:', error);
      return res.sendStatus(200);
    }
  }
}
