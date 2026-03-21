import { eq, desc, asc, and, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { messages } from '../db/schema/index.js';
import { NewMessage, UpdateMessage } from '../types/database.types.js';

export class MessageService {
  /**
   * Create a new message
   */
  static async create(messageData: NewMessage) {
    const [message] = await db.insert(messages).values(messageData).returning();
    return message;
  }

  /**
   * Find message by ID
   */
  static async findById(id: string) {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  /**
   * Get all messages for a user (ordered by received date desc)
   */
  static async findByUserId(userId: string) {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.userId, userId))
      .orderBy(desc(messages.receivedAt));
  }

  /**
   * Get messages by campaign
   */
  static async findByCampaignId(campaignId: string) {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.campaignId, campaignId))
      .orderBy(desc(messages.receivedAt));
  }

  /**
   * Get messages by phone number for a user
   */
  static async findByPhoneNumber(userId: string, phoneNumber: string) {
    return await db
      .select()
      .from(messages)
      .where(and(eq(messages.userId, userId), eq(messages.senderNumber, phoneNumber)))
      .orderBy(desc(messages.receivedAt));
  }

  /**
   * Get all chat threads for a campaign.
   * Each thread = unique senderNumber with their latest message info.
   */
  static async getThreadsByCampaign(campaignId: string) {
    // Subquery: latest receivedAt per (campaignId, senderNumber)
    const latestPerSender = db
      .select({
        senderNumber: messages.senderNumber,
        latestAt: sql<Date>`max(${messages.receivedAt})`.as('latest_at'),
        messageCount: sql<number>`count(*)::int`.as('message_count')
      })
      .from(messages)
      .where(eq(messages.campaignId, campaignId))
      .groupBy(messages.senderNumber)
      .as('latest_per_sender');

    // Join back to get the full latest message row
    const rows = await db
      .select({
        senderNumber: messages.senderNumber,
        messageCount: latestPerSender.messageCount,
        latestAt: latestPerSender.latestAt,
        lastMessageContent: messages.messageContent,
        lastReplyContent: messages.replyContent,
        lastReplyStatus: messages.replyStatus,
        lastMessageId: messages.id,
      })
      .from(latestPerSender)
      .innerJoin(
        messages,
        and(
          eq(messages.senderNumber, latestPerSender.senderNumber),
          eq(messages.receivedAt, latestPerSender.latestAt),
          eq(messages.campaignId, campaignId)
        )
      )
      .orderBy(desc(latestPerSender.latestAt));

    return rows;
  }

  /**
   * Get full message history for a (campaign, senderNumber) thread, oldest-first.
   */
  static async getThreadHistory(campaignId: string, senderNumber: string) {
    return await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.campaignId, campaignId),
          eq(messages.senderNumber, senderNumber)
        )
      )
      .orderBy(asc(messages.receivedAt));
  }

  /**
   * Update message by ID
   */
  static async update(id: string, messageData: UpdateMessage) {
    const [updatedMessage] = await db
      .update(messages)
      .set(messageData)
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage;
  }

  /**
   * Get message count for a user
   */
  static async getCountByUserId(userId: string) {
    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.userId, userId));
    return result.length;
  }

  /**
   * Delete message by ID
   */
  static async delete(id: string) {
    const [deletedMessage] = await db
      .delete(messages)
      .where(eq(messages.id, id))
      .returning();
    return deletedMessage;
  }

  /**
   * Update message reply status
   */
  static async updateReplyStatus(id: string, status: 'pending' | 'sent' | 'replied' | 'failed') {
    const [updatedMessage] = await db
      .update(messages)
      .set({ replyStatus: status })
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage;
  }
}
