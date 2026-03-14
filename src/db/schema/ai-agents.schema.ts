import { pgTable, text, timestamp, uuid, boolean, integer } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

// AI Agents table - OpenAI-powered auto-reply agents for WhatsApp campaigns
export const aiAgents = pgTable('ai_agents', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),               // Agent name e.g. "Support Bot"
  agentTitle: text('agent_title').notNull(),  // Role title e.g. "Customer Support Agent"
  instructions: text('instructions').notNull(), // How the AI should behave / what it should do
  isActive: boolean('is_active').default(false).notNull(),
  messageCount: integer('message_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
