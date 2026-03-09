import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { uploads } from '../db/schema/index.js';
import { NewUpload } from '../types/database.types.js';

export class UploadService {
  /**
   * Create a new upload
   */
  static async create(uploadData: NewUpload) {
    const [upload] = await db.insert(uploads).values(uploadData).returning();
    return upload;
  }

  /**
   * Find upload by ID
   */
  static async findById(id: string) {
    const [upload] = await db.select().from(uploads).where(eq(uploads.id, id));
    return upload;
  }

  /**
   * Find uploads by user ID (without file data for listing)
   */
  static async findByUserId(userId: string) {
    return await db
      .select({
        id: uploads.id,
        userId: uploads.userId,
        fileName: uploads.fileName,
        mimeType: uploads.mimeType,
        fileSize: uploads.fileSize,
        createdAt: uploads.createdAt,
      })
      .from(uploads)
      .where(eq(uploads.userId, userId));
  }

  /**
   * Delete upload by ID
   */
  static async delete(id: string) {
    const [deletedUpload] = await db
      .delete(uploads)
      .where(eq(uploads.id, id))
      .returning();
    return deletedUpload;
  }

  /**
   * Generate public URL for an upload
   */
  static getPublicUrl(id: string, baseUrl: string): string {
    return `${baseUrl}/api/uploads/${id}/file`;
  }
}
