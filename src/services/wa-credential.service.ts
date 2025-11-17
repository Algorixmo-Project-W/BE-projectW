import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { waCredentials } from '../db/schema/index.js';
import { NewWaCredential, UpdateWaCredential, SafeWaCredential } from '../types/database.types.js';

export class WaCredentialService {
  /**
   * Create new WhatsApp credentials
   */
  static async create(credentialData: NewWaCredential) {
    const [credential] = await db
      .insert(waCredentials)
      .values(credentialData)
      .returning();
    return credential;
  }

  /**
   * Find credentials by ID
   */
  static async findById(id: string) {
    const [credential] = await db
      .select()
      .from(waCredentials)
      .where(eq(waCredentials.id, id));
    return credential;
  }

  /**
   * Find credentials by user ID
   */
  static async findByUserId(userId: string) {
    return await db
      .select()
      .from(waCredentials)
      .where(eq(waCredentials.userId, userId));
  }

  /**
   * Find credentials by phone number ID
   */
  static async findByPhoneNumberId(phoneNumberId: string) {
    const [credential] = await db
      .select()
      .from(waCredentials)
      .where(eq(waCredentials.phoneNumberId, phoneNumberId));
    return credential;
  }

  /**
   * Find credentials by business ID
   */
  static async findByBusinessId(businessId: string) {
    const [credential] = await db
      .select()
      .from(waCredentials)
      .where(eq(waCredentials.businessId, businessId));
    return credential;
  }

  /**
   * Get all credentials
   */
  static async findAll() {
    return await db.select().from(waCredentials);
  }

  /**
   * Update credentials by ID
   */
  static async update(id: string, credentialData: UpdateWaCredential) {
    const [updatedCredential] = await db
      .update(waCredentials)
      .set({ ...credentialData, updatedAt: new Date() })
      .where(eq(waCredentials.id, id))
      .returning();
    return updatedCredential;
  }

  /**
   * Delete credentials by ID
   */
  static async delete(id: string) {
    const [deletedCredential] = await db
      .delete(waCredentials)
      .where(eq(waCredentials.id, id))
      .returning();
    return deletedCredential;
  }

  /**
   * Delete all credentials for a user
   */
  static async deleteByUserId(userId: string) {
    return await db
      .delete(waCredentials)
      .where(eq(waCredentials.userId, userId))
      .returning();
  }

  /**
   * Get safe credentials data (without access token)
   */
  static toSafeCredential(credential: any): SafeWaCredential {
    const { accessToken, ...safeCredential } = credential;
    return safeCredential;
  }

  /**
   * Check if credentials exist for a user
   */
  static async userHasCredentials(userId: string): Promise<boolean> {
    const credentials = await this.findByUserId(userId);
    return credentials.length > 0;
  }

  /**
   * Check if phone number ID is already registered
   */
  static async phoneNumberIdExists(phoneNumberId: string): Promise<boolean> {
    const credential = await this.findByPhoneNumberId(phoneNumberId);
    return !!credential;
  }
}
