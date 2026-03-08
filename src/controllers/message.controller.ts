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
