import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';
import { isValidEmail, isValidPassword, sanitizeEmail, sanitizeName } from '../utils/validators.js';
import { hashPassword, comparePassword } from '../utils/password.js';

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

  /**
   * Login user
   * POST /api/users/login
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

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

      // Find user by email
      const user = await UserService.findByEmail(sanitizeEmail(email));
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Compare password
      const isPasswordValid = await comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Return safe user data (without password hash)
      const safeUser = UserService.toSafeUser(user);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: safeUser
      });
    } catch (error) {
      console.error('Error logging in user:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get all users
   * GET /api/users
   */
  static async getAll(_req: Request, res: Response) {
    try {
      const users = await UserService.findAll();
      const safeUsers = users.map(user => UserService.toSafeUser(user));

      return res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: safeUsers
      });
    } catch (error) {
      console.error('Error getting users:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await UserService.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const safeUser = UserService.toSafeUser(user);

      return res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: safeUser
      });
    } catch (error) {
      console.error('Error getting user:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Update user
   * PUT /api/users/:id
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { email, password, name } = req.body;

      // Check if user exists
      const existingUser = await UserService.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Build update object
      const updateData: any = {};

      if (email) {
        if (!isValidEmail(email)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid email format'
          });
        }
        // Check if email is taken by another user
        const emailUser = await UserService.findByEmail(sanitizeEmail(email));
        if (emailUser && emailUser.id !== id) {
          return res.status(409).json({
            success: false,
            message: 'Email already in use'
          });
        }
        updateData.email = sanitizeEmail(email);
      }

      if (password) {
        const passwordValidation = isValidPassword(password);
        if (!passwordValidation.valid) {
          return res.status(400).json({
            success: false,
            message: passwordValidation.message
          });
        }
        updateData.passwordHash = await hashPassword(password);
      }

      if (name !== undefined) {
        updateData.name = sanitizeName(name);
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        });
      }

      const updatedUser = await UserService.update(id, updateData);
      const safeUser = UserService.toSafeUser(updatedUser);

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: safeUser
      });
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Delete user
   * DELETE /api/users/:id
   */
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existingUser = await UserService.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await UserService.delete(id);

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
