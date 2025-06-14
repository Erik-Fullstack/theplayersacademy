import path from "path";
import fs from "fs/promises";
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// Functions:
// UPLOAD

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export class OrgImageController {
  //*
  //* UPLOAD
  //*
  async upload(req: MulterRequest, res: Response) {
    const organizationId = String(req.params.orgId);

    if (!organizationId) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "No image uploaded" });
      return;
    }

    try {
      const orgProfile = await prisma.orgProfile.findUnique({
        where: { organizationId },
      });

      if (!orgProfile) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error("Failed to delete unused file:", unlinkError);
        }
        res.status(404).json({ error: "Organization profile not found" });
        return;
      }

      // Extract just the filename, but store the upload path for frontend
      const relativeFilePath = `uploads/${path.basename(req.file.path)}`;

      // Delete the old logo file if it exists
      if (orgProfile.logo) {
        try {
          // Get the absolute path from the relative path stored in DB
          const oldLogoPath = path.join(__dirname, '..', orgProfile.logo);
          
          // Check if file exists before trying to delete
          const fileStats = await fs.stat(oldLogoPath).catch(() => null);
          
          if (fileStats) {
            await fs.unlink(oldLogoPath);
            console.log(`Deleted old logo: ${orgProfile.logo}`);
          }
        } catch (deleteError) {
          console.error("Failed to delete old logo file:", deleteError);
        }
      }

      // Update the profile with the new logo path
      const updatedProfile = await prisma.orgProfile.update({
        where: { organizationId },
        data: {
          logo: relativeFilePath,
          introText: req.body.introText || orgProfile.introText,
        },
      });

      res.status(200).json({ data: updatedProfile });
    } catch (error) {
      console.error("Error in logo upload:", error);
        
      // If an error occurs, try to delete the uploaded file
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error("Failed to delete file after error:", unlinkError);
        }
      }

      res.status(500).json({ error: "Failed to upload organization logo" });
    }
  };

}

export const orgImageController = new OrgImageController();