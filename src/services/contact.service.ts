import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { contacts } from '../db/schema/index.js';

export class ContactService {
  static async findByPhoneNumber(userId: string, phoneNumber: string) {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(and(eq(contacts.userId, userId), eq(contacts.phoneNumber, phoneNumber)));
    return contact;
  }

  static async findByEmail(userId: string, email: string) {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(and(eq(contacts.userId, userId), eq(contacts.email, email)));
    return contact;
  }

  /**
   * Upsert for WhatsApp contacts — phone is the key identifier.
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

  /**
   * Upsert for web chat contacts — email is the key identifier, phone optional.
   */
  static async upsertWeb(userId: string, data: {
    name: string;
    email: string;
    phone?: string | null;
  }) {
    const existing = await this.findByEmail(userId, data.email);

    if (existing) {
      const [updated] = await db
        .update(contacts)
        .set({
          name: data.name,
          phoneNumber: data.phone || existing.phoneNumber,
          updatedAt: new Date(),
        })
        .where(eq(contacts.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(contacts)
      .values({
        userId,
        name: data.name,
        email: data.email,
        phoneNumber: data.phone || null,
      })
      .returning();
    return created;
  }
}
