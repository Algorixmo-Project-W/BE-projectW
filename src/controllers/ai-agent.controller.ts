import { Request, Response } from 'express';
import { AiAgentService } from '../services/ai-agent.service.js';
import { UserService } from '../services/user.service.js';

export class AiAgentController {
  /**
   * Create AI agent
   * POST /api/ai-agents
   * Body: { userId, name, agentTitle, instructions, isActive? }
   */
  static async create(req: Request, res: Response) {
    try {
      const { userId, name, agentTitle, instructions, isActive } = req.body;

      if (!userId || !name || !agentTitle || !instructions) {
        return res.status(400).json({
          success: false,
          message: 'userId, name, agentTitle, and instructions are required'
        });
      }

      const user = await UserService.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (isActive) {
        await AiAgentService.deactivateAllForUser(userId);
      }

      const agent = await AiAgentService.create({
        userId,
        name: name.trim(),
        agentTitle: agentTitle.trim(),
        instructions: instructions.trim(),
        isActive: isActive || false
      });

      return res.status(201).json({
        success: true,
        message: 'AI agent created successfully',
        data: agent
      });
    } catch (error) {
      console.error('Error creating AI agent:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * Get all AI agents for a user
   * GET /api/ai-agents/user/:userId
   */
  static async getByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const agents = await AiAgentService.findByUserId(userId);
      return res.status(200).json({ success: true, data: agents });
    } catch (error) {
      console.error('Error getting AI agents:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * Get AI agent by ID
   * GET /api/ai-agents/:id
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const agent = await AiAgentService.findById(id);
      if (!agent) {
        return res.status(404).json({ success: false, message: 'AI agent not found' });
      }
      return res.status(200).json({ success: true, data: agent });
    } catch (error) {
      console.error('Error getting AI agent:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * Update AI agent
   * PUT /api/ai-agents/:id
   * Body: { name?, agentTitle?, instructions?, apiKey?, isActive? }
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, agentTitle, instructions, isActive } = req.body;

      const existing = await AiAgentService.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'AI agent not found' });
      }

      if (isActive === true && !existing.isActive) {
        await AiAgentService.deactivateAllForUser(existing.userId);
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (agentTitle !== undefined) updateData.agentTitle = agentTitle.trim();
      if (instructions !== undefined) updateData.instructions = instructions.trim();
      if (isActive !== undefined) updateData.isActive = isActive;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ success: false, message: 'No fields to update' });
      }

      const updated = await AiAgentService.update(id, updateData);
      return res.status(200).json({
        success: true,
        message: 'AI agent updated successfully',
        data: updated
      });
    } catch (error) {
      console.error('Error updating AI agent:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * Delete AI agent
   * DELETE /api/ai-agents/:id
   */
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const existing = await AiAgentService.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'AI agent not found' });
      }
      await AiAgentService.delete(id);
      return res.status(200).json({ success: true, message: 'AI agent deleted successfully' });
    } catch (error) {
      console.error('Error deleting AI agent:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

