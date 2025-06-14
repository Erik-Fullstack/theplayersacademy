import { Request, Response } from "express";
import path from "path";
import fs from "fs/promises";
import { prisma } from "../lib/prisma";
import { FileCategory, fileService } from "../services/fileUpload";
import { FileWithCategory, UploadPayload } from "../types/types";

// Functions:
// CREATE (upload)
// GET ALL
// UPDATE
// DELETE

export class DocumentController {
  // *
  // * CREATE
  // *
  async create(req: Request, res: Response) {
    const { title, description } = req.body;
    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;
      const documentFile = files?.file?.[0] as FileWithCategory;
      const imageFile = files?.image?.[0] as FileWithCategory;

    if (!documentFile) {
      res.status(400).json({ error: "Document file is required" });
      return;
    }
    const category = (documentFile.category || 'document') as FileCategory;
    const storedDocumentFile = await fileService.storeFile(
      documentFile,
      category
    );

    const fileURL = storedDocumentFile.path;

    let imgURL = null;
    if (imageFile) {

      const imageFileCat = (imageFile.category || 'document-preview') as FileCategory;

      const storedImageFile = await fileService.storeFile(
        imageFile,
        imageFileCat
      );
      imgURL = storedImageFile.path;
    }

    try {
      const document = await prisma.document.create({
        data: {
          title,
          description,
          fileURL,
          imgURL,
        },
      });

      res.status(200).json({ data: document });
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  }

  // *
  // * GET ALL
  // *
  async getAll(req: Request, res: Response) {
    try {
      const documents = await prisma.document.findMany();
      res.status(200).json({
        data: documents,
        meta: { total: documents.length },
      });
    } catch (error) {
      console.error("Error retrieving documents:", error);
      res.status(500).json({ error: "Failed to retrieve documents" });
    }
  }

  // *
  // * UPDATE
  // *
  async update(req: Request, res: Response) {
    const { title, description, removeImage } = req.body;
    const { docId } = req.params;
    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;

    try {
      const document = await prisma.document.findUnique({
        where: { id: docId },
      });

      if (!document) {
        res.status(404).json({ error: "Document not found" });
        return;
      }

      const updatePayload: UploadPayload = {};

      if (title !== undefined) {
        updatePayload.title = title;
      }

      if (description !== undefined) {
        updatePayload.description = description;
      }

      // Handle document file update
      if (files?.file?.[0]) {
        const documentFile = files.file[0] as FileWithCategory;
        

        try {
          // Store the new file
          const documentCategory = (documentFile.category || 'document') as FileCategory;

          const storedFile = await fileService.storeFile(
            documentFile,
            documentCategory
          );

          // Update the file URL
          updatePayload.fileURL = storedFile.path;

          // Delete the old file if it exists
          if (document.fileURL) {
            const oldFilePath = path.join(process.cwd(), document.fileURL);
            await fs
              .unlink(oldFilePath)
              .catch((error) =>
                console.warn(
                  `Failed to delete old document file at ${oldFilePath}:`,
                  error
                )
              );
          }
        } catch (error) {
          console.error("Failed to store document file:", error);
          res
            .status(500)
            .json({ error: "Failed to store document file" });
            return;
        }
      }

      // Handle image file update
      if (files?.image?.[0]) {
        const imageFile = files.image[0] as FileWithCategory;

        const imageCategory = (imageFile.category || "image") as FileCategory;

        try {
          // Store the new image
          const storedImage = await fileService.storeFile(
            imageFile,
            imageCategory
          );

          // Update the image URL
          updatePayload.imgURL = storedImage.path;

          // Delete the old image if it exists
          if (document.imgURL) {
            const oldImagePath = path.join(process.cwd(), document.imgURL);
            await fs
              .unlink(oldImagePath)
              .catch((error) =>
                console.warn(
                  `Failed to delete old image at ${oldImagePath}:`,
                  error
                )
              );
          }
        } catch (error) {
          console.error("Failed to store image file:", error);
          res.status(500).json({ error: "Failed to store image file" });
          return;
        }
      } else if (removeImage === "true") {
        // No new image and remove flag set - set image to null
        updatePayload.imgURL = null;

        // Delete existing image file if it exists
        if (document.imgURL) {
          const imagePath = path.join(process.cwd(), document.imgURL);
          await fs
            .unlink(imagePath)
            .catch((error) =>
              console.warn(`Failed to delete image at ${imagePath}:`, error)
            );
        }
      }

      // Make sure we have something to update
      if (Object.keys(updatePayload).length === 0) {
        res.status(400).json({ error: "No update fields provided" });
        return;
      }

      const updatedDocument = await prisma.document.update({
        where: { id: docId },
        data: updatePayload,
      });

      res.status(200).json({ data: updatedDocument });
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ error: "Failed to update document" });
    }
  }

  // *
  // * DELETE
  // *
  async delete(req: Request, res: Response) {
    const { docId } = req.params;
    try {
      const document = await prisma.document.findUnique({
        where: { id: docId },
      });

      if (!document) {
        res.status(404).json({ error: "Document not found" });
        return;
      }

      const deletedDocument = await prisma.document.delete({
        where: { id: docId },
      });

      res.status(200).json({
        data: deletedDocument,
        message: "Document deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  }
}

export const documentController = new DocumentController();
