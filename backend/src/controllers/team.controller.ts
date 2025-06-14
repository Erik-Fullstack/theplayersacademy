import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { getGameFormatByBirthYear } from "../utils/calculateTeamFormat";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { extraCourses } from "../config/constants";
import { Prisma } from "@prisma/client";

// Functions:
// CREATE
// GET ALL
// GET BY ID
// GET BY ORGANIZATION
// UPDATE
// DELETE
// GET TEAM COURSES

export class TeamController {
  // *
  // * CREATE
  // * CREATE /teams/
  // *
  async create(req: Request, res: Response) {
    const { year, gender, coaches, organizationId } = req.body;

    try {
      const gameFormat = await getGameFormatByBirthYear(year);

      if (!gameFormat) {
        res
          .status(400)
          .json({ error: "No game format found for the given birth year" });
        return;
      }

      const extraCourseIds = extraCourses;

      const matchingCourses = await prisma.course.findMany({
        where: {
          gameFormatId: gameFormat.id,
        },
        select: {
          id: true,
        },
      });

      const allCourseIds = [
        ...new Set([...matchingCourses.map((c) => c.id), ...extraCourseIds]),
      ];

      // Verify that all courses exist before trying to connect
      const existingCourses = await prisma.course.findMany({
        where: {
          id: {
            in: allCourseIds,
          },
        },
        select: {
          id: true,
        },
      });

      const verifiedCourseIds = existingCourses.map((c) => c.id);

      const newTeam = await prisma.team.create({
        data: {
          year,
          gender,
          coaches: {
            connect: coaches?.map((id: string) => ({ id })),
          },
          organizationId,
          gameFormatId: gameFormat?.id,
          courses:
            verifiedCourseIds.length > 0
              ? {
                  connect: verifiedCourseIds.map((id) => ({ id })),
                }
              : undefined,
        },
      });

      res.status(201).json({
        data: {
          ...newTeam,
          format: await getGameFormatByBirthYear(year),
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create team" });
    }
  }

  // *
  // * GET ALL
  // *
  async getAll(req: Request, res: Response) {
    try {
      const { org } = req.query;
      const where = org ? { organizationId: org as string } : {};

      const teams = await prisma.team.findMany({
        where,
        include: { coaches: true },
      });

      const teamsWithFormat = await Promise.all(
        teams.map(async (team) => ({
          ...team,
          format: await getGameFormatByBirthYear(team.year),
        }))
      );

      res.status(200).json({
        data: teamsWithFormat,
        meta: { total: teamsWithFormat.length },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve teams" });
    }
  }

  // *
  // * GET BY ID
  // * 
  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const includeCourses = req.query.includeCourses === "true";

    try {
      const team = await prisma.team.findUnique({
        where: { id },
        include: {
          gameFormat: { select: { name: true } },
          coaches: true,
          courses: includeCourses,
        },
      });

      if (!team) {
        res.status(404).json({ error: "Team not found" });
        return;
      }

      res.status(200).json({ data: team });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Faield to retrieve team" });
    }
  }

  // *
  // * GET BY ORGANIZATION
  // * GET /teams/organization/:orgId
  // *
  async getByOrganization(req: Request, res: Response) {
    const { orgId } = req.params;
    const { gender, courseId } = req.query;

    try {
      const whereClause: Prisma.TeamWhereInput = { organizationId: orgId };

      if (gender) {
        whereClause.gender = gender as string;
      }

      if (courseId) {
        whereClause.courses = {
          some: {
            id: courseId as string
          }
        }
      }

      const teams = await prisma.team.findMany({
        where: whereClause,
        include: {
          coaches: true,
          courses: courseId ? {
            where: {
              id: courseId as string
            }
          } : undefined
        },
      });

      // Calculate gender statistics if no gender filter is applied
      const genderStats = { boys: 0, girls: 0, mixed: 0 };
      
      if (!gender) {
        // Count teams by gender
        teams.forEach(team => {
          if (team.gender === "Pojkar") genderStats.boys++;
          else if (team.gender === "Flickor") genderStats.girls++;
        });
      }

      const teamsWithFormat = await Promise.all(
        teams.map(async (team) => ({
          ...team,
          format: await getGameFormatByBirthYear(team.year),
        }))
      );

      if(teamsWithFormat.length === 0) {
        res.status(404).json({error: `No teams found for organization ${orgId}`})
        return
      }

      res.status(200).json({ 
        data: teamsWithFormat,
        meta: {
          total: teamsWithFormat.length,
          filters: {
            organizationId: orgId,
            gender: gender || null,
            courseId: courseId || null
          },
          genderStats: !gender ? genderStats : undefined
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve organization teams" });
    }
  }

  // *
  // * UPDATE
  // * PUT /teams/:id
  // *
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { year, gender, coaches } = req.body;

    try {
      // Get game format if year is being updated
      let gameFormatId;
      if (year) {
        const gameFormat = await getGameFormatByBirthYear(year);
        if (!gameFormat) {
          res
            .status(400)
            .json({ error: "No game format found for the given birth year" });
          return;
        }
        gameFormatId = gameFormat.id;
      }

      // Prepare update data
      const updateData: Prisma.TeamUpdateInput = {};
      if (year) updateData.year = year;
      if (gender) updateData.gender = gender;
      if (gameFormatId) {
        updateData.gameFormat = {
          connect: { id: gameFormatId }
        };
      }
      if (coaches) {
        updateData.coaches = {
          set: coaches.map((id: string) => ({ id })),
        };
      }

      const team = await prisma.team.update({
        where: { id },
        data: updateData,
        include: {
          coaches: true,
          gameFormat: true,
        },
      });

      res.status(200).json({ data: team });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update team" });
    }
  }

  // *
  // * DELETE
  // * DELETE /teams/:id
  // *
  async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await prisma.team.delete({ where: { id } });
      res.status(200).json({ message: "Team deleted successfully" });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          res
            .status(404)
            .json({ error: `Failed to find a team with id: ${id} ` });
        } else {
          res.status(500).json({ error: "Failed to delete team" });
        }
      }
    }
  }

  // *
  // * GET TEAM COURSES
  // *
  async getTeamCourses(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const team = await prisma.team.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!team) {
        res.status(404).json({ error: "Team not found" });
        return;
      }

      const teamWithCourses = await prisma.team.findUnique({
        where: { id },
        select: { courses: true },
      });

      const courses = teamWithCourses?.courses || [];

      res.status(200).json({
        data: courses,
        meta: {
          total: courses.length,
          teamId: id,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve team courses" });
    }
  }
}

export const teamController = new TeamController();
