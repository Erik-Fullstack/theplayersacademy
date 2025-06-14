import { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { updateData } from "../utils/updateHelper";
import { prisma } from "../lib/prisma";
import { fileService } from "../services/fileUpload";
import { Prisma } from "@prisma/client";

// Functions:
// GET BY ORGANIZATION
// UPDATE

export class OrgProfileController {
  // *
  // * GET BY ORGANIZATION
  // *
  async getByOrganizationId(req: Request, res: Response) {
    const { orgId } = req.params;

    try {
      const orgProfile = await prisma.orgProfile.findUnique({ 
        where: { organizationId: orgId } 
      });
      
      if (!orgProfile) {
        res.status(404).json({ error: "Organization profile not found" });
        return;
      }
      
      res.status(200).json({ data: orgProfile });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve organization profile" });
    }
  }

  // *
  // * UPDATE
  // *
  async update(req: Request, res: Response) {
    const { colors, introText, removeLogo } = req.body;
    const { orgId } = req.params;
    const logoFile = req.file;

    console.log("Profile update request received:", {
    body: req.body,
    file: logoFile ? {
      path: logoFile.path,
      filename: logoFile.filename,
      originalname: logoFile.originalname
    } : null
  });

    try {
      const profile = await prisma.orgProfile.findUnique({
        where: { organizationId: orgId },
        select: { id: true, logo: true },
      });
      
      if (!profile) {
        // If profile does not exist, clean up uploaded image
        if (logoFile) {
          await fs.unlink(logoFile.path).catch(error => console.error("Failed to delete temp file:", error));
        }
        res.status(404).json({ error: "Organization profile not found" });
        return;
      }

      const updatePayload: Prisma.OrgProfileUpdateInput = {};

      if (introText !== undefined) {
        updatePayload.introText = introText;
      }
      
      if (colors !== undefined) {
        updatePayload.colors = colors;
      }

      // Handle logo upload or removal
      if (logoFile) {
        try {
          // Use the fileService to move the file from temp to final destination
          const storedFile = await fileService.storeFile(logoFile, "logo");
          
          console.log("File stored successfully:", storedFile);
          
          // Update the database with the new file path
          updatePayload.logo = storedFile.path;
          
          // If there was a previous logo, delete it after successfully storing the new one
          if (profile.logo) {
            const oldLogoPath = path.join(process.cwd(), profile.logo);
            await fs.unlink(oldLogoPath).catch(error =>
              console.warn(`Failed to delete old logo at ${oldLogoPath}:`, error)
            );
          }
        } catch (error) {
          console.error("Failed to store logo:", error);
          res.status(500).json({ error: "Failed to store logo file" });
          return;
        }
      } else if (removeLogo === "true") {
        // No new logo and remove flag set - set logo to null
        updatePayload.logo = null;
        
        // Delete existing logo file if it exists
        if (profile.logo) {
          const logoPath = path.join(process.cwd(), profile.logo);
          await fs.unlink(logoPath).catch(error =>
            console.warn(`Failed to delete logo at ${logoPath}:`, error)
          );
        }
      }

      // Make sure we have something to update
      if (Object.keys(updatePayload).length === 0) {
        res.status(400).json({ error: "No update fields provided" });
        return;
      }

      console.log("Updating profile with:", updatePayload);
      
      // Update the profile in the database
      const updatedProfile = await updateData(
        profile.id, updatePayload, "orgProfile"
      );

      res.status(200).json({ data: updatedProfile });
    } catch (error) {
      console.error("Failed to update organization profile:", error);
      
      // If there's an error, clean up uploaded file
      if (logoFile) {
        await fs.unlink(logoFile.path).catch(err => 
          console.error("Failed to delete temp file after error:", err)
        );
      }

      res.status(500).json({ error: "Failed to update organization profile" });
    }
  }
}

export const orgProfileController = new OrgProfileController();
