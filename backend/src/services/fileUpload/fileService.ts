import fs from "fs/promises";
import path from "path";
import { StoredFile, FileCategory } from "./types";
import { getFileConfig } from "./config";

/**
 * Core file service for handling file operations
 */
export class FileService {
  async storeFile(
    file: Express.Multer.File,
    category: FileCategory
  ): Promise<StoredFile> {
    const config = getFileConfig(category);

    // Create directory if it doesn't exist
    await fs.mkdir(path.join(process.cwd(), config.directory), {
      recursive: true,
    });

    // Generate unique filename with original extension
    const fileExt = path.extname(file.originalname).toLowerCase();
    const filename = `${category}-${Date.now()}${fileExt}`;
    const relativePath = path.join(config.directory, filename);
    const fullPath = path.join(process.cwd(), relativePath);

    // Move file from temp upload location to final location
    await fs.rename(file.path, fullPath);

    return {
      filename,
      originalName: file.originalname,
      path: relativePath.replace(/\\/g, "/"),
      size: file.size,
      mimeType: file.mimetype,
      category,
    };
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(filePath: string): Promise<boolean> {
    if (!filePath) return false;

    try {
      const fullPath = path.join(process.cwd(), filePath);

      // Check if file exists
      const fileExists = await fs.stat(fullPath).catch(() => null);
      if (!fileExists) return false;

      // Delete the file
      await fs.unlink(fullPath);
      return true;
    } catch (error) {
      console.error("Failed to delete file:", error);
      return false;
    }
  }

  /**
   * Check if a file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    if (!filePath) return false;

    try {
      const fullPath = path.join(process.cwd(), filePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}

export const fileService = new FileService();
