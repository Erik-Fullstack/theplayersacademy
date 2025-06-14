import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Prisma, User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { SerializeUser } from "../types/models";

import { updateData } from "../utils/updateHelper";

import { addFullNameToUser } from "../utils/transformers";

// Functions:
// CREATE
// GET ALL
// GET BY ID
// UPDATE
// DELETE

export class OrganizationController {
  // *
  // * CREATE
  // *
  async create(req: Request, res: Response) {
    const { name } = req.body;
    const { id } = req.user as SerializeUser;

    try {
      if (!name) {
        res.status(400).json({ error: "Invalid arguments used" });
        return;
      }

      const org = await prisma.organization.create({
        data: {
          name,
          owner: { connect: { id: id } },
          profile: {
            create: {
              logo: "",
              colors: "",
              introText: "",
            },
          },
          subscription: {
            create: {
              paymentInfo: "",
              seatLimit: 0,
            },
          },
        },
      });
      res.status(201).json({ data: org });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          res
            .status(409)
            .json({ error: "Organization with that name already exists" });
        } else {
          res.status(500).json({ error: "Failed to create organization" });
        }
      }
    }
  }

  // *
  // * GET ALL
  // *
  async getAll(req: Request, res: Response) {
    try {
      const organizations = await prisma.organization.findMany({
        include: {
          subscription: true,
          profile: true,
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      const transformedOrganizations = organizations.map((org) => ({
        ...org,
        owner: addFullNameToUser(org.owner as User),
      }));

      res.status(200).json({
        data: transformedOrganizations,
        meta: { total: transformedOrganizations.length },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve organizations" });
    }
  }

  // *
  // * GET BY ID
  // *
  async getById(req: Request, res: Response) {
    const { orgId } = req.params;
    const { includeUsers, includeTeams, includeSeats } = req.query;

    try {
      const includeObj: Partial<Prisma.OrganizationInclude> = {
        subscription: true,
        profile: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      };

      if (includeSeats === "true") {
        includeObj.seats = true;
      }

      if (includeUsers === "true") {
        includeObj.users = {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            teams: true,
          },
        };

        if (includeTeams === "true") {
          includeObj.users.include = { teams: true };
        }
      }

      const organization = await prisma.organization.findUnique({
        where: { id:orgId },
        include: includeObj,
      });

      if (!organization) {
        res.status(404).json({ error: "Organization not found" });
        return;
      }

      res.status(200).json({ data: organization });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve organization" });
    }
  }

  // *
  // * UPDATE
  // *
  async update(req: Request, res: Response) {
    const { orgId } = req.params;
    const { name, ownerId } = req.body;

    try {
      const updatedOrg = await updateData(
        orgId,
        { name, ownerId },
        "organization"
      );
      res.status(200).json({ data: updatedOrg });
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: "Failed to update organization" });
    }
  }

  // *
  // * DELETE
  // *
  async delete(req: Request, res: Response) {
    const { orgId } = req.params;

    try {
      const response = await prisma.organization.delete({ where: { id:orgId } });
      res.status(200).json({ message: response });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error });
    }
  }
}

export const organizationController = new OrganizationController();
