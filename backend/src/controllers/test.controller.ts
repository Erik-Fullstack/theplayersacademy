import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { enrichUser } from "../utils/userHelpers";

type UserRole = "USER" | "ADMIN" | "SUPERADMIN";

const getUserByRole = (role: UserRole) => async (req: Request, res: Response) => {
  const includeParam = req.query.include as string || "";
  const includes = includeParam.split(",").filter(Boolean);
  const includeSeatStats = includes.includes("seatstats");
  
  try {
    const user = await prisma.user.findFirst({
      where: { role },
      include: { 
        organization: {
          include: {
            subscription: true,
            profile: true,
          },
        },
        teams: { include: { courses: true } },
        assignedCourses: true,
        seat: true,
      }
    });

    if (!user) {
      res.status(404).json({ error: `No ${role.toLowerCase()} found` });
      return;
    }

    // Use the consolidated enrichment function
    const enrichedUser = await enrichUser(user, {
      includeCourses: true,
      includeSeatStats: includeSeatStats,
    });

    res.status(200).json({ 
      data: enrichedUser
    });
  } catch (error) {
    console.error(`Error fetching ${role}:`, error);
    res.status(500).json({ error: "Failed to retrieve test user" });
  }
};

export class TestController {
  getUser = getUserByRole("USER");
  getAdmin = getUserByRole("ADMIN");
  getSuperAdmin = getUserByRole("SUPERADMIN");
  
  getByRole = async (req: Request, res: Response) => {
    const { role } = req.params as { role: UserRole };
    
    if (!["USER", "ADMIN", "SUPERADMIN"].includes(role)) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }
    
    return getUserByRole(role as UserRole)(req, res);
  };
}

export const testController = new TestController();
