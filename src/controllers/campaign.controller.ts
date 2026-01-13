import { Request, Response } from 'express';
import { CampaignService } from '../services/campaign.service.js';
import { UserService } from '../services/user.service.js';

export class CampaignController {
  /**
   * Create a new campaign
   * POST /api/campaigns
   */
  static async create(req: Request, res: Response) {
    try {
      const { userId, name, fixedReply, isActive } = req.body;

      // Validate required fields
      if (!userId || !name || !fixedReply) {
        return res.status(400).json({
          success: false,
          message: 'userId, name, and fixedReply are required'
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

      // If setting as active, deactivate all other campaigns first
      if (isActive) {
        await CampaignService.deactivateAllForUser(userId);
      }

      const newCampaign = await CampaignService.create({
        userId,
        name: name.trim(),
        fixedReply: fixedReply.trim(),
        isActive: isActive || false
      });

      return res.status(201).json({
        success: true,
        message: 'Campaign created successfully',
        data: newCampaign
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get all campaigns for a user
   * GET /api/campaigns/user/:userId
   */
  static async getByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const campaigns = await CampaignService.findByUserId(userId);

      return res.status(200).json({
        success: true,
        message: 'Campaigns retrieved successfully',
        data: campaigns
      });
    } catch (error) {
      console.error('Error getting campaigns:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get campaign by ID
   * GET /api/campaigns/:id
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const campaign = await CampaignService.findById(id);
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Campaign retrieved successfully',
        data: campaign
      });
    } catch (error) {
      console.error('Error getting campaign:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Update campaign
   * PUT /api/campaigns/:id
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, fixedReply, isActive } = req.body;

      const existingCampaign = await CampaignService.findById(id);
      if (!existingCampaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      // If activating this campaign, deactivate all others first
      if (isActive === true && !existingCampaign.isActive) {
        await CampaignService.deactivateAllForUser(existingCampaign.userId);
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (fixedReply !== undefined) updateData.fixedReply = fixedReply.trim();
      if (isActive !== undefined) updateData.isActive = isActive;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        });
      }

      const updatedCampaign = await CampaignService.update(id, updateData);

      return res.status(200).json({
        success: true,
        message: 'Campaign updated successfully',
        data: updatedCampaign
      });
    } catch (error) {
      console.error('Error updating campaign:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Delete campaign
   * DELETE /api/campaigns/:id
   */
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existingCampaign = await CampaignService.findById(id);
      if (!existingCampaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found'
        });
      }

      await CampaignService.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Campaign deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
