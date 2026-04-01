import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { campaigns } from '../db/schema/index.js';
import { NewCampaign, UpdateCampaign } from '../types/database.types.js';

export class CampaignService {
  /**
   * Create a new campaign
   */
  static async create(campaignData: NewCampaign) {
    const [campaign] = await db.insert(campaigns).values(campaignData).returning();
    return campaign;
  }

  /**
   * Find campaign by ID
   */
  static async findById(id: string) {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }

  /**
   * Get all campaigns for a user
   */
  static async findByUserId(userId: string) {
    return await db.select().from(campaigns).where(eq(campaigns.userId, userId));
  }

  /**
   * Get active campaign for a user
   */
  static async findActiveByUserId(userId: string) {
    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(and(eq(campaigns.userId, userId), eq(campaigns.isActive, true)));
    return campaign;
  }

  /**
   * Update campaign by ID
   */
  static async update(id: string, campaignData: UpdateCampaign) {
    const [updatedCampaign] = await db
      .update(campaigns)
      .set({ ...campaignData, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();
    return updatedCampaign;
  }

  /**
   * Deactivate all campaigns for a user (used when activating a new one)
   */
  static async deactivateAllForUser(userId: string) {
    await db
      .update(campaigns)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(campaigns.userId, userId));
  }

  /**
   * Increment message count for a campaign
   */
  static async incrementMessageCount(id: string) {
    const campaign = await this.findById(id);
    if (campaign) {
      await db
        .update(campaigns)
        .set({ messageCount: campaign.messageCount + 1, updatedAt: new Date() })
        .where(eq(campaigns.id, id));
    }
  }

  /**
   * Reset message count for a campaign (used during clean)
   */
  static async resetMessageCount(id: string) {
    const [updatedCampaign] = await db
      .update(campaigns)
      .set({ messageCount: 0, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();
    return updatedCampaign;
  }

  /**
   * Delete campaign by ID
   */
  static async delete(id: string) {
    const [deletedCampaign] = await db
      .delete(campaigns)
      .where(eq(campaigns.id, id))
      .returning();
    return deletedCampaign;
  }
}
