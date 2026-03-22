import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { aiIntegrations } from '../db/schema/index.js';
import { UpdateAiIntegration } from '../types/database.types.js';

export class AiIntegrationService {
  /**
   * Get integrations for an AI agent (returns null if none set yet)
   */
  static async findByAgentId(aiAgentId: string) {
    const [integration] = await db
      .select()
      .from(aiIntegrations)
      .where(eq(aiIntegrations.aiAgentId, aiAgentId));
    return integration || null;
  }

  /**
   * Upsert integrations for an AI agent.
   * Creates a new row if none exists, updates if one does.
   */
  static async upsert(aiAgentId: string, data: UpdateAiIntegration) {
    const existing = await AiIntegrationService.findByAgentId(aiAgentId);

    if (existing) {
      const [updated] = await db
        .update(aiIntegrations)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(aiIntegrations.aiAgentId, aiAgentId))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(aiIntegrations)
      .values({ aiAgentId, ...data })
      .returning();
    return created;
  }

  /**
   * Delete integrations for an AI agent
   */
  static async deleteByAgentId(aiAgentId: string) {
    const [deleted] = await db
      .delete(aiIntegrations)
      .where(eq(aiIntegrations.aiAgentId, aiAgentId))
      .returning();
    return deleted;
  }
}
