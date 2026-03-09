import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

// Uploads table - Stores uploaded images/files
export const uploads = pgTable('uploads', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(), // Original file name
  mimeType: text('mime_type').notNull(), // e.g., 'image/jpeg', 'image/png'
  fileSize: integer('file_size').notNull(), // Size in bytes
  fileData: text('file_data').notNull(), // Base64 encoded file data
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
