import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { contacts } from '../db/schema/index.js';


export class ContactService {
  /**
   * Find contact by userId and phoneNumber
   */
  static async findByPhoneNumber(userId: string, phoneNumber: string) {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(and(eq(contacts.userId, userId), eq(contacts.phoneNumber, phoneNumber)));
    return contact;
  }

  /**
   * Upsert a contact. If it exists, update the name, else create it.
   */
  static async upsert(userId: string, phoneNumber: string, name: string | null) {
    const existing = await this.findByPhoneNumber(userId, phoneNumber);

    if (existing) {
      if (name && existing.name !== name) {
        const [updated] = await db
          .update(contacts)
          .set({ name, updatedAt: new Date() })
          .where(eq(contacts.id, existing.id))
          .returning();
        return updated;
      }
      return existing;
    }

    const [created] = await db
      .insert(contacts)
      .values({ userId, phoneNumber, name })
      .returning();
    return created;
  }
}
