import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { campaigns } from './campaigns.schema';

// Messages table - Stores incoming messages with their auto-reply info
export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'set null' }),
  senderNumber: text('sender_number').notNull(), // Customer's phone number
  messageType: text('message_type').notNull().default('text'), // 'text', 'image', etc.
  messageContent: text('message_content').notNull(), // Incoming message text or media URL
  replyContent: text('reply_content'), // The auto-reply sent back (null if no reply)
  replyStatus: text('reply_status').default('pending'), // 'pending', 'sent', 'replied', 'failed'
  sessionId: text('session_id'), // Web chat session ID (null for WhatsApp messages)
  whatsappMessageId: text('whatsapp_message_id'), // WhatsApp's incoming message ID
  replyMessageId: text('reply_message_id'), // WhatsApp's outgoing reply message ID
  receivedAt: timestamp('received_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
