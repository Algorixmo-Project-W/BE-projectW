import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.schema.js';

// WhatsApp Credentials table - Stores WhatsApp Cloud API credentials
export const waCredentials = pgTable('wa_credentials', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  businessId: text('business_id').notNull(),
  phoneNumberId: text('phone_number_id').notNull(),
  accessToken: text('access_token').notNull(), // Should be encrypted in production
  whatsappUserId: text('whatsapp_user_id').notNull(),
  phoneNumber: text('phone_number').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
