import { WaCredentialService } from './wa-credential.service.js';

interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class WhatsAppService {
  /**
   * Send a text message via WhatsApp Cloud API
   */
  static async sendTextMessage(
    userId: string,
    toNumber: string,
    messageBody: string
  ): Promise<SendMessageResponse> {
    try {
      // Get user's WhatsApp credentials
      const credentials = await WaCredentialService.findByUserId(userId);
      
      if (!credentials || credentials.length === 0) {
        return {
          success: false,
          error: 'No WhatsApp credentials found for user'
        };
      }

      const credential = credentials[0]; // Use first credential
      const { phoneNumberId, accessToken } = credential;

      // WhatsApp Cloud API endpoint
      const apiUrl = `https://graph.facebook.com/v24.0/${phoneNumberId}/messages`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: toNumber,
          type: 'text',
          text: {
            body: messageBody
          }
        })
      });

      const data = await response.json() as any;

      if (response.ok && data.messages && data.messages[0]) {
        console.log('✅ WhatsApp message sent successfully:', data.messages[0].id);
        return {
          success: true,
          messageId: data.messages[0].id
        };
      } else {
        console.error('❌ WhatsApp API error:', data);
        return {
          success: false,
          error: data.error?.message || 'Unknown error'
        };
      }
    } catch (error) {
      console.error('❌ Error sending WhatsApp message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
