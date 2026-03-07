declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Database Configuration
      DATABASE_URL?: string;
      DB_HOST?: string;
      DB_PORT?: string;
      DB_USER?: string;
      DB_PASSWORD?: string;
      DB_NAME?: string;

      // Application Configuration
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;

      // WhatsApp Cloud API Configuration
      WHATSAPP_API_URL: string;
      WHATSAPP_ACCESS_TOKEN: string;
      WHATSAPP_PHONE_NUMBER_ID: string;
      WHATSAPP_BUSINESS_ID: string;

      // Webhook Configuration
      WEBHOOK_VERIFY_TOKEN: string;
      WHATSAPP_APP_SECRET?: string;
    }
  }
}

export {};
