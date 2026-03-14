import { pgTable, text, timestamp, uuid, boolean, integer } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { aiAgents } from './ai-agents.schema';

// Campaigns table - Stores auto-reply campaigns
export const campaigns = pgTable('campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  replyType: text('reply_type').default('text').notNull(), // 'text', 'image', or 'ai'
  fixedReply: text('fixed_reply'), // Used when replyType is 'text' or 'image'
  replyImageUrl: text('reply_image_url'), // Image URL (required if replyType is 'image')
  aiAgentId: uuid('ai_agent_id').references(() => aiAgents.id, { onDelete: 'set null' }), // Linked AI agent (required if replyType is 'ai')
  isActive: boolean('is_active').default(false).notNull(),
  messageCount: integer('message_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
