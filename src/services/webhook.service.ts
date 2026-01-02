import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { webhookConfigs } from '../db/schema/index.js';
import { NewWebhookConfig, UpdateWebhookConfig } from '../types/database.types.js';

export class WebhookService {
  /**
   * Generate a secure random verify token
   */
  static generateVerifyToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate callback URL (fixed URL for Meta)
   * Meta requires a single fixed URL, not dynamic URLs with user IDs
   */
  static generateCallbackUrl(baseUrl: string): string {
    return `${baseUrl}/api/webhook/whatsapp`;
  }

  /**
   * Create new webhook configuration
   */
  static async create(webhookData: NewWebhookConfig) {
    const [webhook] = await db
      .insert(webhookConfigs)
      .values(webhookData)
      .returning();
    return webhook;
  }

  /**
   * Find webhook config by ID
   */
  static async findById(id: string) {
    const [webhook] = await db
      .select()
      .from(webhookConfigs)
      .where(eq(webhookConfigs.id, id));
    return webhook;
  }

  /**
   * Find webhook config by user ID
   */
  static async findByUserId(userId: string) {
    const [webhook] = await db
      .select()
      .from(webhookConfigs)
      .where(eq(webhookConfigs.userId, userId));
    return webhook;
  }

  /**
   * Find webhook config by verify token
   */
  static async findByVerifyToken(verifyToken: string) {
    const [webhook] = await db
      .select()
      .from(webhookConfigs)
      .where(eq(webhookConfigs.verifyToken, verifyToken));
    return webhook;
  }

  /**
   * Get all webhook configs
   */
  static async findAll() {
    return await db.select().from(webhookConfigs);
  }

  /**
   * Update webhook config by ID
   */
  static async update(id: string, webhookData: UpdateWebhookConfig) {
    const [updatedWebhook] = await db
      .update(webhookConfigs)
      .set({ ...webhookData, updatedAt: new Date() })
      .where(eq(webhookConfigs.id, id))
      .returning();
    return updatedWebhook;
  }

  /**
   * Delete webhook config by ID
   */
  static async delete(id: string) {
    const [deletedWebhook] = await db
      .delete(webhookConfigs)
      .where(eq(webhookConfigs.id, id))
      .returning();
    return deletedWebhook;
  }

  /**
   * Delete webhook config by user ID
   */
  static async deleteByUserId(userId: string) {
    const [deletedWebhook] = await db
      .delete(webhookConfigs)
      .where(eq(webhookConfigs.userId, userId))
      .returning();
    return deletedWebhook;
  }

  /**
   * Check if user already has a webhook config
   */
  static async userHasWebhook(userId: string): Promise<boolean> {
    const webhook = await this.findByUserId(userId);
    return !!webhook;
  }

  /**
   * Regenerate verify token for a webhook
   */
  static async regenerateToken(id: string) {
    const newToken = this.generateVerifyToken();
    return await this.update(id, { verifyToken: newToken });
  }

  /**
   * Toggle webhook active status
   */
  static async toggleActive(id: string, isActive: boolean) {
    return await this.update(id, { isActive });
  }
}
