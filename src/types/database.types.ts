import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users, waCredentials, webhookConfigs, campaigns, messages, uploads } from '../db/schema/index.js';

// User types
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// WhatsApp Credentials types
export type WaCredential = InferSelectModel<typeof waCredentials>;
export type NewWaCredential = InferInsertModel<typeof waCredentials>;

// Webhook Config types
export type WebhookConfig = InferSelectModel<typeof webhookConfigs>;
export type NewWebhookConfig = InferInsertModel<typeof webhookConfigs>;

// Campaign types
export type Campaign = InferSelectModel<typeof campaigns>;
export type NewCampaign = InferInsertModel<typeof campaigns>;

// Message types
export type Message = InferSelectModel<typeof messages>;
export type NewMessage = InferInsertModel<typeof messages>;

// Upload types
export type Upload = InferSelectModel<typeof uploads>;
export type NewUpload = InferInsertModel<typeof uploads>;

// Partial update types
export type UpdateUser = Partial<Omit<NewUser, 'id' | 'createdAt'>>;
export type UpdateWaCredential = Partial<Omit<NewWaCredential, 'id' | 'createdAt'>>;
export type UpdateWebhookConfig = Partial<Omit<NewWebhookConfig, 'id' | 'createdAt'>>;
export type UpdateCampaign = Partial<Omit<NewCampaign, 'id' | 'createdAt'>>;
export type UpdateMessage = Partial<Omit<NewMessage, 'id' | 'createdAt'>>;

// User without sensitive data (for API responses)
export type SafeUser = Omit<User, 'passwordHash'>;

// WhatsApp Credentials without sensitive data (for API responses)
export type SafeWaCredential = Omit<WaCredential, 'accessToken'>;

// Upload without file data (for list responses)
export type SafeUpload = Omit<Upload, 'fileData'>;

// Webhook Config for API responses
export type SafeWebhookConfig = WebhookConfig;
