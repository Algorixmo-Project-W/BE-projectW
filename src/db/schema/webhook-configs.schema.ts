import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

// Webhook Configurations table - Stores webhook callback URLs and verify tokens
export const webhookConfigs = pgTable('webhook_configs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  callbackUrl: text('callback_url').notNull(), // The generated callback URL for this user
  verifyToken: text('verify_token').notNull().unique(), // Token generated for WhatsApp webhook verification
  isActive: boolean('is_active').default(true).notNull(), // Whether this webhook is active
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
