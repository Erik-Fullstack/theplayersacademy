import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { addFullNameToUser } from "../utils/transformers";

// GET ALL

export class OrganizationUserController {
  // *
  // * GET ALL
  // *
  async getAll(req: Request, res: Response) {
    const { orgId } = req.params;
  
    try {
      const users = await prisma.user.findMany({
        where: { organizationId: orgId },
        include: { teams: true },
      });
  
      const transformedUsers = users.map(user => addFullNameToUser(user));
  
      res.status(200).json({
        data: transformedUsers,
        meta: { total: users.length }
      });
    } catch {
      res
        .status(500)
        .json({ error: "Failed to retrieve organization users" });
    }
  };
}

export const organizationUserController = new OrganizationUserController();
