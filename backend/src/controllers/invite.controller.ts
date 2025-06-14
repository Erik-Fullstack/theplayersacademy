import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { generateCode } from "../utils/generateInvCode";
import { transport } from "../index";
import { FRONTEND_BASE_URL } from "../config/api";

// Functions:
// CREATE
// GET BY ORGANIZATION
// DELETE

export class InvitationController {
  // *
  // * CREATE
  // *
  async create(req: Request, res: Response) {
    const { orgId } = req.params;
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required." });
      return;
    }
    if (!orgId?.trim()) {
      res.status(400).json({ error: "Invalid or missing organization ID." });
      return;
    }

    let inviteCode = "";

    try {
      const organization = await prisma.organization.findUnique({
        where: { id: orgId },
      });

      if (!organization) {
        console.error(`Organization with ID ${orgId} not found`);
        res.status(404).json({ error: "Organization not found" });
        return;
      }

      // Check if an invite already exists for this email in this org
      const existingInvite = await prisma.invitationCode.findFirst({
        where: {
          email,
          organizationId: orgId,
        },
      });

      if (existingInvite) {
        console.log("Invite already exists for this email:", email);
        res.status(200).json({ data: existingInvite });
        return;
      }

      // Generate a unique invite code
      while (inviteCode === "") {
        const tempCode = generateCode(10);
        const findResponse = await prisma.invitationCode.findUnique({
          where: { code: tempCode },
        });
        if (!findResponse) inviteCode = tempCode;
      }
      const newInvite = await prisma.invitationCode.create({
        data: {
          email,
          code: inviteCode,
          organizationId: orgId,
        },
      });
      await transport.sendMail({
        from: '"Players Academy"',
        to: `${email}`,
        subject: `Inbjudan från ${organization.name}`,
        text: "Use the code on our website to link to your fotball association",
        html: `<h2>Du have blivit inbjuden som tränare till ${organization.name}</h2></br></br>
              <h3><a href=${FRONTEND_BASE_URL}/my-account/${newInvite.code}>Acceptera inbjudan</a></h3>`
      })
      
      res.status(200).json({ data: newInvite });

      try {
        const newInvite = await prisma.invitationCode.create({
          data: {
            email,
            code: inviteCode,
            organizationId: orgId,
          },
        });

        console.log("Invite created successfully:", newInvite.id);
        res.status(200).json({ data: newInvite });
      } catch (dbError) {
        console.error("Database error creating invite:", dbError);
        res.status(500).json({
          error: "Database error creating invite",
          details: (dbError as Error).message,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create invite" });
    }
  };
  // *
  // * GET
  // *
  async getOrgInfoFromInvitation(req: Request, res: Response) {
    const { inviteCode } = req.params;
    try {
      const invites = await prisma.invitationCode.findFirst({
        where: { code: inviteCode },
      });
      if(!invites) {res.status(500).json({error: 'No invitation found'})} 
      else 
      {
        const org = await prisma.organization.findFirst({
        where: {id: invites.organizationId}
        })
        res.status(200).json({data: org});
      }

    } catch (error) {
      console.error(error)
      res.status(500).json({ error: "Failed to retrieve invites" });

    }
  }

  // *
  // * GET BY ORGANIZATION
  // *
  async getByOrganization(req: Request, res: Response) {
    const { orgId } = req.params;
    try {
      const invites = await prisma.invitationCode.findMany({
        where: { organizationId: orgId },
      });

      res.status(200).json({
        data: invites,
        meta: { total: invites.length },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve invites" });
    }
  }

  // *
  // * DELETE
  // *
  async delete(req: Request, res: Response) {
    const { inviteId } = req.params;
    
    if (!inviteId) {
      res.status(400).json({ error: "Invite ID is required" });
      return;
    }

    try {
      // Check if the invite exists
      const invite = await prisma.invitationCode.findUnique({
        where: { id: inviteId },
      });

      if (!invite) {
        res.status(404).json({ error: "Invitation not found" });
        return;
      }

      // Delete the invite
      await prisma.invitationCode.delete({
        where: { id: inviteId },
      });

      console.log(`Invitation ${inviteId} deleted successfully`);
      res.status(200).json({ 
        message: "Invitation deleted successfully",
        data: invite
      });
    } catch (error) {
      console.error("Error deleting invitation:", error);
      res.status(500).json({ 
        error: "Failed to delete invitation",
        details: error instanceof Error ? error.message : undefined
      });
    }
  }
}

export const invitationController = new InvitationController();
