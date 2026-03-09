import { pgTable, text, timestamp, uuid, boolean, integer } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

// Campaigns table - Stores auto-reply campaigns
export const campaigns = pgTable('campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  replyType: text('reply_type').default('text').notNull(), // 'text' or 'image'
  fixedReply: text('fixed_reply').notNull(), // The auto-reply message (or caption for image)
  replyImageUrl: text('reply_image_url'), // Image URL (required if replyType is 'image')
  isActive: boolean('is_active').default(false).notNull(),
  messageCount: integer('message_count').default(0).notNull(), // Track responses sent
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
