import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users, waCredentials, webhookConfigs } from '../db/schema/index.js';

// User types
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// WhatsApp Credentials types
export type WaCredential = InferSelectModel<typeof waCredentials>;
export type NewWaCredential = InferInsertModel<typeof waCredentials>;

// Webhook Config types
export type WebhookConfig = InferSelectModel<typeof webhookConfigs>;
export type NewWebhookConfig = InferInsertModel<typeof webhookConfigs>;

// Partial update types
export type UpdateUser = Partial<Omit<NewUser, 'id' | 'createdAt'>>;
export type UpdateWaCredential = Partial<Omit<NewWaCredential, 'id' | 'createdAt'>>;
export type UpdateWebhookConfig = Partial<Omit<NewWebhookConfig, 'id' | 'createdAt'>>;

// User without sensitive data (for API responses)
export type SafeUser = Omit<User, 'passwordHash'>;

// WhatsApp Credentials without sensitive data (for API responses)
export type SafeWaCredential = Omit<WaCredential, 'accessToken'>;

// Webhook Config for API responses
export type SafeWebhookConfig = WebhookConfig;
