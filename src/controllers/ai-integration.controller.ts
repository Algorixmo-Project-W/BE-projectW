import { Request, Response } from 'express';
import { AiIntegrationService } from '../services/ai-integration.service.js';
import { AiAgentService } from '../services/ai-agent.service.js';

export class AiIntegrationController {
  /**
   * Get integrations for an AI agent
   * GET /api/ai-agents/:agentId/integrations
   */
  static async getByAgentId(req: Request, res: Response) {
    try {
      const { agentId } = req.params;

      const agent = await AiAgentService.findById(agentId);
      if (!agent) {
        return res.status(404).json({ success: false, message: 'AI agent not found' });
      }

      const integration = await AiIntegrationService.findByAgentId(agentId);
      return res.status(200).json({
        success: true,
        data: integration || { aiAgentId: agentId, zoom: null, hubspot: null, google: null }
      });
    } catch (error) {
      console.error('Error getting integrations:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * Set (upsert) integrations for an AI agent
   * PUT /api/ai-agents/:agentId/integrations
   * Body: { zoom?, hubspot?, google? }
   */
  static async upsert(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      const { zoom, hubspot, google } = req.body;

      const agent = await AiAgentService.findById(agentId);
      if (!agent) {
        return res.status(404).json({ success: false, message: 'AI agent not found' });
      }

      const integration = await AiIntegrationService.upsert(agentId, {
        zoom: zoom?.trim() || null,
        hubspot: hubspot?.trim() || null,
        google: google?.trim() || null
      });

      return res.status(200).json({
        success: true,
        message: 'Integrations saved successfully',
        data: integration
      });
    } catch (error) {
      console.error('Error saving integrations:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * Delete all integrations for an AI agent
   * DELETE /api/ai-agents/:agentId/integrations
   */
  static async delete(req: Request, res: Response) {
    try {
      const { agentId } = req.params;

      const agent = await AiAgentService.findById(agentId);
      if (!agent) {
        return res.status(404).json({ success: false, message: 'AI agent not found' });
      }

      await AiIntegrationService.deleteByAgentId(agentId);
      return res.status(200).json({ success: true, message: 'Integrations deleted successfully' });
    } catch (error) {
      console.error('Error deleting integrations:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
