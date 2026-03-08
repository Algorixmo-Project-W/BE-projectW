import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { campaigns } from './campaigns.schema';

// Messages table - Stores incoming and outgoing messages
export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'set null' }),
  senderNumber: text('sender_number').notNull(), // Customer's phone number
  messageType: text('message_type').notNull().default('text'), // 'text', 'image', etc.
  messageContent: text('message_content').notNull(), // Message text or media URL
  direction: text('direction').notNull().default('incoming'), // 'incoming' or 'outgoing'
  replyStatus: text('reply_status').default('pending'), // 'pending', 'success', 'failed'
  whatsappMessageId: text('whatsapp_message_id'), // WhatsApp's message ID
  receivedAt: timestamp('received_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
