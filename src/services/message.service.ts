import { eq, desc } from 'drizzle-orm';
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
  static async findByPhoneNumber(userId: string, _phoneNumber: string) {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.userId, userId))
      .orderBy(desc(messages.receivedAt));
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
