import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema/index.js';
import { NewUser, UpdateUser, SafeUser } from '../types/database.types.js';

export class UserService {
  /**
   * Create a new user
   */
  static async create(userData: NewUser) {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  /**
   * Find user by ID
   */
  static async findById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  /**
   * Get all users
   */
  static async findAll() {
    return await db.select().from(users);
  }

  /**
   * Update user by ID
   */
  static async update(id: string, userData: UpdateUser) {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  /**
   * Delete user by ID
   */
  static async delete(id: string) {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return deletedUser;
  }

  /**
   * Get safe user data (without password hash)
   */
  static toSafeUser(user: any): SafeUser {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return !!user;
  }
}
