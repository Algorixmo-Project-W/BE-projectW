import { WaCredentialService } from './wa-credential.service.js';

interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export type ReplyType = 'text' | 'image';

export class WhatsAppService {
  /**
   * Send a reply message (text or image) based on campaign settings
   */
  static async sendReply(
    userId: string,
    toNumber: string,
    replyType: ReplyType,
    messageBody: string,
    imageUrl?: string | null
  ): Promise<SendMessageResponse> {
    if (replyType === 'image' && imageUrl) {
      return this.sendImageMessage(userId, toNumber, imageUrl, messageBody);
    }
    return this.sendTextMessage(userId, toNumber, messageBody);
  }

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

  /**
   * Send a direct text message using explicit credentials (no userId lookup)
   */
  static async sendMessage(
    phoneNumberId: string,
    accessToken: string,
    toNumber: string,
    messageBody: string
  ): Promise<SendMessageResponse> {
    try {
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
          text: { body: messageBody }
        })
      });
      const data = await response.json() as any;
      if (response.ok && data.messages?.[0]) {
        return { success: true, messageId: data.messages[0].id };
      }
      return { success: false, error: data.error?.message || 'Unknown error' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Mark a message as read and send typing indicator
   */
  static async markAsRead(phoneNumberId: string, accessToken: string, messageId: string): Promise<void> {
    try {
      await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
          typing_indicator: { type: 'text' }
        })
      });
    } catch (error) {
      console.error('❌ Failed to mark message as read:', error);
    }
  }

  /**
   * Send an image message via WhatsApp Cloud API
   */
  static async sendImageMessage(
    userId: string,
    toNumber: string,
    imageUrl: string,
    caption?: string
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

      const imagePayload: any = {
        link: imageUrl
      };
      
      // Add caption if provided
      if (caption) {
        imagePayload.caption = caption;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: toNumber,
          type: 'image',
          image: imagePayload
        })
      });

      const data = await response.json() as any;

      if (response.ok && data.messages && data.messages[0]) {
        console.log('✅ WhatsApp image sent successfully:', data.messages[0].id);
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
      console.error('❌ Error sending WhatsApp image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
