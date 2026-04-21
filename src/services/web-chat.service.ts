import { eq, and, asc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { webSessions, messages } from '../db/schema/index.js';
import { randomUUID } from 'crypto';

export class WebChatService {
  static generateSessionId(): string {
    return randomUUID();
  }

  static async createSession(data: {
    userId: string;
    campaignId: string;
    contactId?: string | null;
    contactName: string;
    contactEmail: string;
    contactPhone?: string | null;
  }) {
    const sessionId = this.generateSessionId();
    const [session] = await db
      .insert(webSessions)
      .values({ ...data, sessionId })
      .returning();
    return session;
  }

  static async findSession(sessionId: string) {
    const [session] = await db
      .select()
      .from(webSessions)
      .where(eq(webSessions.sessionId, sessionId));
    return session || null;
  }

  static async getSessionHistory(campaignId: string, sessionId: string) {
    return await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.campaignId, campaignId),
          eq(messages.sessionId, sessionId)
        )
      )
      .orderBy(asc(messages.receivedAt));
  }

  static async saveMessage(data: {
    userId: string;
    campaignId: string;
    sessionId: string;
    messageContent: string;
    replyContent: string | null;
    replyStatus: 'pending' | 'sent' | 'failed';
  }) {
    const [msg] = await db
      .insert(messages)
      .values({
        userId: data.userId,
        campaignId: data.campaignId,
        sessionId: data.sessionId,
        senderNumber: data.sessionId,
        messageType: 'text',
        messageContent: data.messageContent,
        replyContent: data.replyContent,
        replyStatus: data.replyStatus,
        receivedAt: new Date(),
      })
      .returning();
    return msg;
  }
}
