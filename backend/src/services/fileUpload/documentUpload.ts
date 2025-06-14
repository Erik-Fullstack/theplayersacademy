import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { FileErrorType } from "./types";
import { getFileConfig } from "./config";

interface CategorizedMulterFile extends Express.Multer.File {
  category?: string;
}


// Create document upload middleware that handles both document and image files
export const documentUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Configure storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const tempDir = path.join(process.cwd(), "uploads/temp");
      // Ensure temp directory exists
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      cb(null, tempDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    }
  });

  // Define file filter with field-specific validations
  const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    console.log(`Filtering file: ${file.originalname}, mimetype: ${file.mimetype}, field: ${file.fieldname}`);
    const categorizedFile = file as CategorizedMulterFile;

    // Different validation based on field name
    if (file.fieldname === "file") {
      // Document validations
      const docConfig = getFileConfig("document");
      
      // Check MIME type for documents
      if (docConfig.allowedTypes.includes(file.mimetype)) {
        console.log(`Document file accepted by MIME type: ${file.mimetype}`);
        categorizedFile.category = "document";
        return cb(null, true);
      }
      
      // Fallback to extension check for documents
      const fileExt = path.extname(file.originalname).toLowerCase();
      if ([".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"].includes(fileExt)) {
        console.log(`Document file accepted by extension: ${fileExt}`);
        categorizedFile.category = "document-preview";
        return cb(null, true);
      }
      
      // Reject invalid document
      console.log(`Document file rejected: ${file.originalname}`);
      return cb(new Error(`Invalid document file type. Allowed formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX`));
    } 
    else if (file.fieldname === "image") {
      // Image validations
      const imageConfig = getFileConfig("document-preview");
      
      // Check MIME type for images
      if (imageConfig.allowedTypes.includes(file.mimetype)) {
        console.log(`Image file accepted by MIME type: ${file.mimetype}`);
        categorizedFile.category = "document-preview";
        return cb(null, true);
      }
      
      // Fallback to extension check for images
      const fileExt = path.extname(file.originalname).toLowerCase();
      if ([".jpg", ".jpeg", ".png", ".gif"].includes(fileExt)) {
        console.log(`Image file accepted by extension: ${fileExt}`);
        categorizedFile.category = "document-preview";
        return cb(null, true);
      }
      
      // Reject invalid image
      console.log(`Image file rejected: ${file.originalname}`);
      return cb(new Error(`Invalid image file type. Allowed formats: JPEG, PNG, GIF`));
    } 
    else {
      // Unexpected field
      console.log(`Unexpected field: ${file.fieldname}`);
      return cb(new Error(`Unexpected field: ${file.fieldname}`));
    }
  };

  // Create multer upload instance
  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 20 * 1024 * 1024 // 20MB max file size
    }
  });

  // Apply upload middleware
  const uploadFields = upload.fields([
    { name: "file", maxCount: 1 },
    { name: "image", maxCount: 1 }
  ]);

  // Process the upload with error handling
  uploadFields(req, res, (err) => {
    if (err) {
      console.error("File upload error:", err);

      // Handle multer specific errors
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            error: "File size exceeds limit",
            type: FileErrorType.SIZE_EXCEEDED,
          });
        }
        return res.status(400).json({
          error: err.message,
          type: FileErrorType.UPLOAD_ERROR,
        });
      }

      // Handle general errors
      return res.status(400).json({
        error: err.message,
        type: FileErrorType.UPLOAD_ERROR,
      });
    }

    // Log successful uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    console.log("Files uploaded successfully:", 
      files ? Object.keys(files).map(key => 
        files[key].map(f => `${f.fieldname}: ${f.originalname} (${f.mimetype})`)
      ).flat() : "No files"
    );

    next();
  });
};