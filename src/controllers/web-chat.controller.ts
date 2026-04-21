import { Request, Response } from 'express';
import { CampaignService } from '../services/campaign.service.js';
import { AiAgentService } from '../services/ai-agent.service.js';
import { AiIntegrationService } from '../services/ai-integration.service.js';
import { WebChatService } from '../services/web-chat.service.js';
import { ContactService } from '../services/contact.service.js';
import { CampaignService as CS } from '../services/campaign.service.js';

export class WebChatController {
  /**
   * GET /api/chat/:campaignId
   * Returns public campaign info for the landing page to display
   */
  static async getCampaignInfo(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;

      const campaign = await CampaignService.findById(campaignId);
      if (!campaign || !campaign.isActive || campaign.channel !== 'web') {
        return res.status(404).json({ success: false, message: 'Chat not found or inactive' });
      }

      return res.status(200).json({
        success: true,
        data: {
          campaignId: campaign.id,
          name: campaign.name,
          firstMessage: campaign.firstMessage || null,
        }
      });
    } catch (error) {
      console.error('Error getting campaign info:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/chat/:campaignId/start
   * Registers contact, creates session, returns sessionId + first message
   */
  static async startSession(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const { name, email, phone } = req.body;

      if (!name || !email) {
        return res.status(400).json({ success: false, message: 'Name and email are required' });
      }

      const campaign = await CampaignService.findById(campaignId);
      if (!campaign || !campaign.isActive || campaign.channel !== 'web') {
        return res.status(404).json({ success: false, message: 'Chat not found or inactive' });
      }

      // Upsert contact and get id to link to session
      let contactId: string | null = null;
      try {
        const contact = await ContactService.upsertWeb(campaign.userId, { name, email, phone });
        contactId = contact.id;
      } catch (err) {
        console.error('Failed to upsert contact:', err);
      }

      // Create web session linked to contact
      const session = await WebChatService.createSession({
        userId: campaign.userId,
        campaignId,
        contactId,
        contactName: name,
        contactEmail: email,
        contactPhone: phone,
      });

      // Build first message
      let firstMessage = campaign.firstMessage || null;

      // If AI campaign, generate greeting
      if (campaign.replyType === 'ai' && campaign.aiAgentId) {
        try {
          const agent = await AiAgentService.findById(campaign.aiAgentId);
          if (agent) {
            const integrations = await AiIntegrationService.findByAgentId(agent.id);
            firstMessage = await AiAgentService.generateReply(
              agent,
              '__greeting__',
              [],
              integrations,
              name
            );

            // Save the greeting as the first reply in history
            await WebChatService.saveMessage({
              userId: campaign.userId,
              campaignId,
              sessionId: session.sessionId,
              messageContent: '__greeting__',
              replyContent: firstMessage,
              replyStatus: 'sent',
            });
          }
        } catch (err) {
          console.error('AI greeting failed:', err);
        }
      }

      return res.status(201).json({
        success: true,
        data: {
          sessionId: session.sessionId,
          firstMessage,
        }
      });
    } catch (error) {
      console.error('Error starting web chat session:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * POST /api/chat/:campaignId/message
   * Accepts a user message, returns AI/fixed reply
   */
  static async sendMessage(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const { sessionId, message } = req.body;

      if (!sessionId || !message) {
        return res.status(400).json({ success: false, message: 'sessionId and message are required' });
      }

      const session = await WebChatService.findSession(sessionId);
      if (!session || session.campaignId !== campaignId) {
        return res.status(404).json({ success: false, message: 'Session not found' });
      }

      const campaign = await CampaignService.findById(campaignId);
      if (!campaign || !campaign.isActive) {
        return res.status(404).json({ success: false, message: 'Campaign inactive' });
      }

      let replyContent: string | null = null;
      let replyStatus: 'pending' | 'sent' | 'failed' = 'pending';

      if (campaign.replyType === 'ai' && campaign.aiAgentId) {
        try {
          const agent = await AiAgentService.findById(campaign.aiAgentId);
          if (agent) {
            const historyLimit = parseInt(process.env.AI_HISTORY_MESSAGES || '5', 10);
            const history = await WebChatService.getSessionHistory(campaignId, sessionId);
            // Exclude the synthetic greeting row from real history
            const priorMessages = history
              .filter(m => m.messageContent !== '__greeting__')
              .slice(-historyLimit);

            const integrations = await AiIntegrationService.findByAgentId(agent.id);
            replyContent = await AiAgentService.generateReply(
              agent,
              message,
              priorMessages,
              integrations,
              null
            );
            replyStatus = 'sent';
          }
        } catch (err: any) {
          console.error('AI reply failed:', err.message);
          replyStatus = 'failed';
        }
      } else if (campaign.fixedReply) {
        replyContent = campaign.fixedReply;
        replyStatus = 'sent';
      }

      await WebChatService.saveMessage({
        userId: campaign.userId,
        campaignId,
        sessionId,
        messageContent: message,
        replyContent,
        replyStatus,
      });

      await CS.incrementMessageCount(campaignId);

      return res.status(200).json({
        success: true,
        data: { reply: replyContent }
      });
    } catch (error) {
      console.error('Error handling web chat message:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * GET /api/chat/:campaignId/history?sessionId=xxx
   * Returns full message history for a session
   */
  static async getHistory(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const { sessionId } = req.query as { sessionId: string };

      if (!sessionId) {
        return res.status(400).json({ success: false, message: 'sessionId is required' });
      }

      const session = await WebChatService.findSession(sessionId);
      if (!session || session.campaignId !== campaignId) {
        return res.status(404).json({ success: false, message: 'Session not found' });
      }

      const history = await WebChatService.getSessionHistory(campaignId, sessionId);

      const formatted = history
        .filter(m => m.messageContent !== '__greeting__')
        .flatMap(m => {
          const turns = [];
          turns.push({ role: 'user', content: m.messageContent, timestamp: m.receivedAt });
          if (m.replyContent) {
            turns.push({ role: 'assistant', content: m.replyContent, timestamp: m.receivedAt });
          }
          return turns;
        });

      // Prepend greeting if it exists
      const greetingRow = history.find(m => m.messageContent === '__greeting__');
      if (greetingRow?.replyContent) {
        formatted.unshift({ role: 'assistant', content: greetingRow.replyContent, timestamp: greetingRow.receivedAt });
      }

      return res.status(200).json({ success: true, data: formatted });
    } catch (error) {
      console.error('Error getting chat history:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
