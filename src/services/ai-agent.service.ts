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

  /**
   * Generate AI reply using OpenAI gpt-4o-mini.
   * @param agent       - AI agent config (name, agentTitle, instructions)
   * @param incomingMessage - The new message just received
   * @param priorMessages   - Previous messages in this thread, oldest-first
   */
  static async generateReply(
    agent: { name: string; agentTitle: string; instructions: string },
    incomingMessage: string,
    priorMessages: Array<{ messageContent: string; replyContent: string | null }> = []
  ): Promise<string> {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) throw new Error('OPENAI_API_KEY is not set in environment');

    const systemPrompt = `You are ${agent.name}, a ${agent.agentTitle}.\n\n${agent.instructions}\n\nKeep your reply concise and friendly. Do not use markdown formatting.`;

    // Build conversation turns from prior messages
    const historyMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    for (const msg of priorMessages) {
      historyMessages.push({ role: 'user', content: msg.messageContent });
      if (msg.replyContent) {
        historyMessages.push({ role: 'assistant', content: msg.replyContent });
      }
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...historyMessages,
          { role: 'user', content: incomingMessage }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    const data = await response.json() as any;

    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    return data.choices[0].message.content.trim();
  }
}

