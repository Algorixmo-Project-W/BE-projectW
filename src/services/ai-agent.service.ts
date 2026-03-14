import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { aiAgents } from '../db/schema/index.js';
import { NewAiAgent, UpdateAiAgent } from '../types/database.types.js';

export class AiAgentService {
  static async create(data: NewAiAgent) {
    const [agent] = await db.insert(aiAgents).values(data).returning();
    return agent;
  }

  static async findById(id: string) {
    const [agent] = await db.select().from(aiAgents).where(eq(aiAgents.id, id));
    return agent;
  }

  static async findByUserId(userId: string) {
    return await db.select().from(aiAgents).where(eq(aiAgents.userId, userId));
  }

  static async findActiveByUserId(userId: string) {
    const agents = await db.select().from(aiAgents).where(eq(aiAgents.userId, userId));
    return agents.find(a => a.isActive) || null;
  }

  static async update(id: string, data: UpdateAiAgent) {
    const [updated] = await db
      .update(aiAgents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiAgents.id, id))
      .returning();
    return updated;
  }

  static async deactivateAllForUser(userId: string) {
    await db
      .update(aiAgents)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(aiAgents.userId, userId));
  }

  static async delete(id: string) {
    const [deleted] = await db.delete(aiAgents).where(eq(aiAgents.id, id)).returning();
    return deleted;
  }
}

