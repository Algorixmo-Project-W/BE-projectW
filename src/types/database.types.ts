import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users, waCredentials } from '../db/schema/index.js';

// User types
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// WhatsApp Credentials types
export type WaCredential = InferSelectModel<typeof waCredentials>;
export type NewWaCredential = InferInsertModel<typeof waCredentials>;

// Partial update types
export type UpdateUser = Partial<Omit<NewUser, 'id' | 'createdAt'>>;
export type UpdateWaCredential = Partial<Omit<NewWaCredential, 'id' | 'createdAt'>>;

// User without sensitive data (for API responses)
export type SafeUser = Omit<User, 'passwordHash'>;

// WhatsApp Credentials without sensitive data (for API responses)
export type SafeWaCredential = Omit<WaCredential, 'accessToken'>;
