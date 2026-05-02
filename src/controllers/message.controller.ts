import { Request, Response } from 'express';
import { MessageService } from '../services/message.service.js';
import { UserService } from '../services/user.service.js';

export class MessageController {
  /**
   * Get all messages for a user
   * GET /api/messages/user/:userId
   */
  static async getByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const messages = await MessageService.findByUserId(userId);

      return res.status(200).json({
        success: true,
        message: 'Messages retrieved successfully',
        data: messages
      });
    } catch (error) {
      console.error('Error getting messages:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get messages by campaign
   * GET /api/messages/campaign/:campaignId
   */
  static async getByCampaignId(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;

      const messages = await MessageService.findByCampaignId(campaignId);

      return res.status(200).json({
        success: true,
        message: 'Messages retrieved successfully',
        data: messages
      });
    } catch (error) {
      console.error('Error getting messages:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get message by ID
   * GET /api/messages/:id
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const message = await MessageService.findById(id);
      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Message retrieved successfully',
        data: message
      });
    } catch (error) {
      console.error('Error getting message:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Create a message (for testing or manual entry)
   * POST /api/messages
   */
  static async create(req: Request, res: Response) {
    try {
      const { userId, campaignId, senderNumber, messageType, messageContent, replyContent, replyStatus } = req.body;

      // Validate required fields
      if (!userId || !senderNumber || !messageContent) {
        return res.status(400).json({
          success: false,
          message: 'userId, senderNumber, and messageContent are required'
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

      const newMessage = await MessageService.create({
        userId,
        campaignId: campaignId || null,
        senderNumber,
        messageType: messageType || 'text',
        messageContent,
        replyContent: replyContent || null,
        replyStatus: replyStatus || 'pending'
      });

      return res.status(201).json({
        success: true,
        message: 'Message created successfully',
        data: newMessage
      });
    } catch (error) {
      console.error('Error creating message:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get all chat threads for a campaign (grouped by senderNumber)
   * GET /api/messages/threads/:campaignId
   */
  static async getThreadsByCampaign(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const threads = await MessageService.getThreadsByCampaign(campaignId);
      return res.status(200).json({
        success: true,
        message: 'Threads retrieved successfully',
        data: threads
      });
    } catch (error) {
      console.error('Error getting threads:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * Get full message history for a (campaign, senderNumber) thread
   * GET /api/messages/thread/:campaignId/:senderNumber
   */
  static async getThreadHistory(req: Request, res: Response) {
    try {
      const { campaignId, senderNumber } = req.params;
      const history = await MessageService.getThreadHistory(campaignId, decodeURIComponent(senderNumber));
      return res.status(200).json({
        success: true,
        message: 'Thread history retrieved successfully',
        data: history
      });
    } catch (error) {
      console.error('Error getting thread history:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * Get all direct threads (no campaign) for a user
   * GET /api/messages/threads/user/:userId
   */
  static async getThreadsByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const threads = await MessageService.getThreadsByUser(userId);
      return res.status(200).json({
        success: true,
        message: 'Threads retrieved successfully',
        data: threads
      });
    } catch (error) {
      console.error('Error getting user threads:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * Get full message history for a (userId, senderNumber) direct thread
   * GET /api/messages/thread/user/:userId/:senderNumber
   */
  static async getThreadByUser(req: Request, res: Response) {
    try {
      const { userId, senderNumber } = req.params;
      const history = await MessageService.getThreadByUser(userId, decodeURIComponent(senderNumber));
      return res.status(200).json({
        success: true,
        message: 'Thread history retrieved successfully',
        data: history
      });
    } catch (error) {
      console.error('Error getting user thread:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * Delete message
   * DELETE /api/messages/:id
   */
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existingMessage = await MessageService.findById(id);
      if (!existingMessage) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }

      await MessageService.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Message deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
