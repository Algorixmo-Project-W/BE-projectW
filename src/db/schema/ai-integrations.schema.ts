import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
import { aiAgents } from './ai-agents.schema';

// AI Integrations table - Booking/meeting links linked to an AI agent (one row per agent)
export const aiIntegrations = pgTable('ai_integrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  aiAgentId: uuid('ai_agent_id').notNull().unique().references(() => aiAgents.id, { onDelete: 'cascade' }),
  zoom: text('zoom'),       // Zoom booking link
  hubspot: text('hubspot'), // HubSpot meeting link
  google: text('google'),   // Google Calendar booking link
  useCustomerName: boolean('use_customer_name').default(false).notNull(), // Say Hi using WhatsApp profile name
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
