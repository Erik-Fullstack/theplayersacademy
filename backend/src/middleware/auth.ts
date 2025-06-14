import { Request, Response, NextFunction } from "express";
import { SerializeUser } from "../types/models";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const username = process.env.LEARNIFIER_PUBLIC_KEY;
const password = process.env.LEARNIFIER_SECRET_KEY;
const endpointURL = process.env.LEARNIFIER;

// Check if Learnifier credentials are available
const hasLearnifierCredentials = username && password && endpointURL;
const auth = hasLearnifierCredentials ? btoa(`${username}:${password}`) : null;


export function authCheck(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({ message: "Protected route blocked" });
  }
}

export async function learnifierAccount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user as SerializeUser | undefined;

  if (!user) {
    return next();
  }

  // If Learnifier credentials are not available, skip this step
  if (!hasLearnifierCredentials) {
    console.warn("Learnifier credentials not available, skipping Learnifier account creation");
    return next();
  }

  try {
    const request = await fetch(`${endpointURL}/users`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        externalId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        primaryEmail: user.email,
      }),
    });

    if (!request.ok) {
      console.warn(`Learnifier API request failed with status: ${request.status}`);
      return next();
    }

    const response = await request.json();

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { learnifierId: response.userId },
      });
    } catch (dbError) {
      console.error("Failed to update user with Learnifier ID:", dbError);
    }

    next();
  } catch (error) {
    console.error("Learnifier account creation error:", error);
    // Don't block authentication flow, just continue
    next();
  }
}

export const checkOrgOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as SerializeUser;
  const orgId = req.params.orgId;

  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { ownerId: true },
    });

    if (!organization) {
      res.status(404).json({ error: "Organization not found" });
      return;
    }

    if (user.role === "SUPERADMIN" || organization.ownerId === user.id) {
      next();
      return;
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const checkSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as SerializeUser | undefined;

  if (!user || user.role !== "SUPERADMIN") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  return next();
};
