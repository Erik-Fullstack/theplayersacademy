import { FileConfig, FileCategory } from "./types";

// Define configurations for different file categories
const fileConfigs: Record<FileCategory, FileConfig> = {
  image: {
    directory: "uploads/images",
    allowedTypes: ["image/jpeg", "image/png", "image/gif"],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  document: {
    directory: "uploads/documents",
    allowedTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/powerpoint",
      "application/x-mspowerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.openxmlformats-officedocument.presentationml", 
    ],
    maxSize: 20 * 1024 * 1024, // 20MB for documents
  },
  "document-preview": {
    directory: "uploads/document-previews",
    allowedTypes: ["image/jpeg", "image/png", "image/gif"],
    maxSize: 2 * 1024 * 1024, // 2MB
  },
  logo: {
    directory: "uploads/logos",
    allowedTypes: ["image/jpeg", "image/png", "image/svg+xml"],
    maxSize: 2 * 1024 * 1024, // 2MB
  },
};

/**
 * Get configuration for a specific file category
 */
export function getFileConfig(category: FileCategory): FileConfig {
  return fileConfigs[category] || fileConfigs.image;
}
