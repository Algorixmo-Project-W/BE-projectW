import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';
import { isValidEmail, isValidPassword, sanitizeEmail, sanitizeName } from '../utils/validators.js';
import { hashPassword } from '../utils/password.js';

export class UserController {
  /**
   * Create a new user
   * POST /api/users
   */
  static async create(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Validate email format
      if (!isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // Validate password
      const passwordValidation = isValidPassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          success: false,
          message: passwordValidation.message
        });
      }

      // Check if email already exists
      const emailExists = await UserService.emailExists(email);
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const newUser = await UserService.create({
        email: sanitizeEmail(email),
        passwordHash,
        name: sanitizeName(name)
      });

      // Return safe user data (without password hash)
      const safeUser = UserService.toSafeUser(newUser);

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: safeUser
      });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
