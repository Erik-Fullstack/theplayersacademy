/**
 * File categories supported by the system
 */
export type FileCategory = "image" | "document" | "document-preview" | "logo";

/**
 * Configuration for file handling
 */
export interface FileConfig {
  directory: string;
  allowedTypes: string[];
  maxSize: number; // in bytes
}

/**
 * Stored file information returned after upload
 */
export interface StoredFile {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimeType: string;
  category: FileCategory;
}

/**
 * Error types for file operations
 */
export enum FileErrorType {
  INVALID_TYPE = "INVALID_TYPE",
  SIZE_EXCEEDED = "SIZE_EXCEEDED",
  UPLOAD_ERROR = "UPLOAD_ERROR",
  FILE_NOT_FOUND = "FILE_NOT_FOUND",
  DELETE_ERROR = "DELETE_ERROR",
}

/**
 * Custom file operation error
 */
export class FileError extends Error {
  type: FileErrorType;

  constructor(message: string, type: FileErrorType) {
    super(message);
    this.type = type;
    this.name = "FileError";
  }
}
