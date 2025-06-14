import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { FileCategory, FileErrorType } from "./types";
import { getFileConfig } from "./config";
import path from "path";

/**
 * Factory function to create upload middleware for a specific file category
 */
export function createUploadMiddleware(category: FileCategory) {
  const config = getFileConfig(category);

  // Configure temporary storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Store in temporary uploads folder first
      cb(null, "uploads/temp");
    },
    filename: (req, file, cb) => {
      // Generate a temporary filename
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}`);
    },
  });

  // Filter files by allowed types
  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const config = getFileConfig(category);

    // Log incoming file for debugging
    console.log(
      `Filtering file: ${file.originalname}, mimetype: ${file.mimetype}, field: ${file.fieldname}`
    );

    // First check MIME type
    if (config.allowedTypes.includes(file.mimetype)) {
      console.log(`File accepted by MIME type: ${file.mimetype}`);
      cb(null, true);
      return;
    }

    // If MIME type check fails, try extension validation as fallback
    const fileExt = path.extname(file.originalname).toLowerCase();

    console.log(`MIME type check failed, checking extension: ${fileExt}`);

    // Define allowed extensions based on category
    if (
      category === "document" &&
      [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"].includes(
        fileExt
      )
    ) {
      console.log(`Document file accepted by extension: ${fileExt}`);
      cb(null, true);
      return;
    }

    if (
      (category === "document-preview" || category === "image") &&
      [".jpg", ".jpeg", ".png", ".gif"].includes(fileExt)
    ) {
      console.log(`Image file accepted by extension: ${fileExt}`);
      cb(null, true);
      return;
    }

    if (
      category === "logo" &&
      [".jpg", ".jpeg", ".png", ".svg"].includes(fileExt)
    ) {
      console.log(`Logo file accepted by extension: ${fileExt}`);
      cb(null, true);
      return;
    }

    // If we get here, both MIME type and extension checks failed
    console.log(
      `File rejected: ${file.originalname}, mimetype: ${file.mimetype}`
    );
    cb(
      new Error(`Invalid file type. Allowed: ${config.allowedTypes.join(", ")}`)
    );
  };

  // Create the multer middleware
  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: config.maxSize },
  });

  // Create a wrapped middleware that handles errors
  return {
    single: (fieldName: string) => {
      return (req: Request, res: Response, next: NextFunction) => {
        upload.single(fieldName)(req, res, (err) => {
          if (err) {
            console.error("File upload error:", err);

            if (err instanceof multer.MulterError) {
              if (err.code === "LIMIT_FILE_SIZE") {
                res.status(400).json({
                  error: "File size exceeds limit",
                  type: FileErrorType.SIZE_EXCEEDED,
                });
                return;
              }
            }

            res.status(400).json({
              error: err.message,
              type: FileErrorType.UPLOAD_ERROR,
            });
            return;
          }

          // Add the category to the request for later use
          if (req.file) {
            (req as any).fileCategory = category;
          }

          next();
        });
      };
    },

    array: (fieldName: string, maxCount?: number) => {
      return (req: Request, res: Response, next: NextFunction) => {
        upload.array(fieldName, maxCount)(req, res, (err) => {
          if (err) {
            console.error("File upload error:", err);

            if (err instanceof multer.MulterError) {
              if (err.code === "LIMIT_FILE_SIZE") {
                res.status(400).json({
                  error: "File size exceeds limit",
                  type: FileErrorType.SIZE_EXCEEDED,
                });
                return;
              }
            }

            res.status(400).json({
              error: err.message,
              type: FileErrorType.UPLOAD_ERROR,
            });
            return;
          }

          // Add the category to the request for later use
          if (req.files) {
            (req as any).fileCategory = category;
          }

          next();
        });
      };
    },

    fields: (fieldsConfig: { name: string; maxCount?: number }[]) => {
      return (req: Request, res: Response, next: NextFunction) => {
        upload.fields(fieldsConfig)(req, res, (err) => {
          if (err) {
            console.error("File upload error:", err);

            if (err instanceof multer.MulterError) {
              if (err.code === "LIMIT_FILE_SIZE") {
                res.status(400).json({
                  error: "File size exceeds limit",
                  type: FileErrorType.SIZE_EXCEEDED,
                });
                return;
              }
            }

            res.status(400).json({
              error: err.message,
              type: FileErrorType.UPLOAD_ERROR,
            });
            return;
          }

          // Add the category to the request for later use
          if (req.files) {
            (req as any).fileCategory = category;
          }

          next();
        });
      };
    },
  };
}

/**
 * Get a pre-configured middleware for common file types
 */
export const upload = {
  image: createUploadMiddleware("image"),
  document: createUploadMiddleware("document"),
  logo: createUploadMiddleware("logo"),
};
