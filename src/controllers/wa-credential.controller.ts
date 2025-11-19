import { Request, Response } from 'express';
import { WaCredentialService } from '../services/wa-credential.service.js';
import { UserService } from '../services/user.service.js';

export class WaCredentialController {
  /**
   * Add new WhatsApp credentials
   * POST /api/wa-credentials/add
   */
  static async add(req: Request, res: Response) {
    try {
      const {
        userId,
        businessId,
        phoneNumberId,
        accessToken,
        whatsappUserId,
        phoneNumber
      } = req.body;

      // Validate required fields
      if (!userId || !businessId || !phoneNumberId || !accessToken || !whatsappUserId || !phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required: userId, businessId, phoneNumberId, accessToken, whatsappUserId, phoneNumber'
        });
      }

      // Validate user exists
      const user = await UserService.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if phone number ID is already registered
      const phoneNumberExists = await WaCredentialService.phoneNumberIdExists(phoneNumberId);
      if (phoneNumberExists) {
        return res.status(409).json({
          success: false,
          message: 'Phone number ID is already registered'
        });
      }

      // Create credentials
      const newCredential = await WaCredentialService.create({
        userId,
        businessId: businessId.trim(),
        phoneNumberId: phoneNumberId.trim(),
        accessToken: accessToken.trim(),
        whatsappUserId: whatsappUserId.trim(),
        phoneNumber: phoneNumber.trim()
      });

      // Return safe credential data (without access token)
      const safeCredential = WaCredentialService.toSafeCredential(newCredential);

      return res.status(201).json({
        success: true,
        message: 'WhatsApp credentials added successfully',
        data: safeCredential
      });
    } catch (error) {
      console.error('Error adding WhatsApp credentials:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get WhatsApp credentials by user ID
   * GET /api/wa-credentials/user/:userId
   */
  static async getByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const credentials = await WaCredentialService.findByUserId(userId);

      // Return safe credentials (without access tokens)
      const safeCredentials = credentials.map(cred => 
        WaCredentialService.toSafeCredential(cred)
      );

      return res.status(200).json({
        success: true,
        message: 'Credentials retrieved successfully',
        data: safeCredentials
      });
    } catch (error) {
      console.error('Error retrieving credentials:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  /**
   * Update WhatsApp credentials
   * PUT /api/wa-credentials/:id
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        businessId,
        phoneNumberId,
        accessToken,
        whatsappUserId,
        phoneNumber
      } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Credential ID is required'
        });
      }

      // Check if credentials exist
      const existingCredential = await WaCredentialService.findById(id);
      if (!existingCredential) {
        return res.status(404).json({
          success: false,
          message: 'Credentials not found'
        });
      }

      // Build update object with only provided fields
      const updateData: any = {};
      if (businessId) updateData.businessId = businessId.trim();
      if (phoneNumberId) updateData.phoneNumberId = phoneNumberId.trim();
      if (accessToken) updateData.accessToken = accessToken.trim();
      if (whatsappUserId) updateData.whatsappUserId = whatsappUserId.trim();
      if (phoneNumber) updateData.phoneNumber = phoneNumber.trim();

      // Check if nothing to update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      // Update credentials
      const updatedCredential = await WaCredentialService.update(id, updateData);

      // Return safe credential data (without access token)
      const safeCredential = WaCredentialService.toSafeCredential(updatedCredential);

      return res.status(200).json({
        success: true,
        message: 'Credentials updated successfully',
        data: safeCredential
      });
    } catch (error) {
      console.error('Error updating credentials:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Delete WhatsApp credentials
   * DELETE /api/wa-credentials/:id
   */
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Credential ID is required'
        });
      }

      // Check if credentials exist
      const existingCredential = await WaCredentialService.findById(id);
      if (!existingCredential) {
        return res.status(404).json({
          success: false,
          message: 'Credentials not found'
        });
      }

      // Delete credentials
      await WaCredentialService.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Credentials deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting credentials:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
