import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

import { updateData } from "../utils/updateHelper";
import { addFullNameToUser } from "../utils/transformers";
import { Course, InvitationCode, SerializeUser } from "../types/models";
import { getCourseData } from "../utils/projectUtils";
import { enrichUser, enrichUsers } from "../utils/userHelpers";
import { Prisma, Role } from "@prisma/client";
import { UserWithIncludes } from "../types/responses";

// Functions:
// CREATE
// CREATE WITH INVITE CODE
// GET ALL
// GET BY ID
// GET USER DATA
// GET BY COURSE
// UPDATE
// DELETE

export class UserController {
  // *
  // * CREATE
  // *
  async create(req: Request, res: Response) {
    const {
      firstName,
      lastName,
      email,
      // TODO: role
      // TODO: organization
      organizationId,
    } = req.body;

    try {
      const user = await prisma.user.create({
        data: { firstName, lastName, email, organizationId },
      });
      res.status(201).json({ data: user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create user" });
    }
  }

  //*
  //* UPDATE USER WITH INVITE CODE AND LINK TO ORGINIZATION
  //*
  async updateWithInviteCode(req: Request, res: Response) {
    const { inviteCode } = req.params;
    const { email } = req.user as SerializeUser;
    try {
      const userData: InvitationCode | null =
        await prisma.invitationCode.findFirst({ where: { code: inviteCode } });

      if (!userData) {
        res.status(404).json({ error: "Invite code not found" });
        return;
      }
      if (email !== userData.email)
        res.status(500).json({ error: "email does not match" });
      const user = await prisma.user.update({
        where: { email: userData.email },
        data: {
          organizationId: userData.organizationId,
        },
      });
      if (user) {
        await prisma.invitationCode.delete({ where: { code: inviteCode } });
      }

      res.status(200).json({ data: user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create user from invite code" });
    }
  }

  // *
  // * GET ALL
  // *
  async getAll(req: Request, res: Response) {
    const { role: userRole } = req.user as SerializeUser;

    try {
      const { role, organizationId, courseId } = req.query;
      const filter: Prisma.UserWhereInput = {};
      const includeParam = (req.query.include as string) || "";
      const includes = includeParam.split(",").filter(Boolean);
      const includeSeatStats = includes.includes("seatstats");

      if (role) filter.role = role as Role;
      if (organizationId) filter.organizationId = organizationId as string;
      if (!organizationId && userRole !== "SUPERADMIN") {
        res.status(404).json({ error: "No organization id provided" });
        return;
      }

      const usersWithCourse: UserWithIncludes[] = [];
      if (courseId) {
        const directlyAssigned = await prisma.user.findMany({
          where: {
            ...filter,
            assignedCourses: {
              some: { id: courseId as string },
            },
          },
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
          },
        });

        const assignedViaTeams = await prisma.user.findMany({
          where: {
            ...filter,
            teams: {
              some: {
                courses: { some: { id: courseId as string } },
              },
            },
          },
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
          },
        });

        // Merge the two sets of users, avoiding duplicates
        const combinedIds = new Set();
        for (const user of directlyAssigned) {
          combinedIds.add(user.id);
          usersWithCourse.push(user);
        }

        for (const user of assignedViaTeams) {
          if (!combinedIds.has(user.id)) {
            usersWithCourse.push(user);
          }
        }
      }

      const users = courseId
        ? usersWithCourse
        : await prisma.user.findMany({
            where: filter,
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
            },
          });

      const enrichedUsers = await enrichUsers(users, {
        includeCourses: true,
        includeSeatStats: includeSeatStats,
      });

      const finalUsers = courseId
        ? enrichedUsers.filter(
            (user) =>
              user.courses &&
              user.courses.some((course: Course) => course.id === courseId)
          )
        : enrichedUsers;

      res.status(200).json({
        data: finalUsers,
        meta: {
          total: finalUsers.length,
          filters: { role, organizationId },
        },
      });
    } catch (error) {
      console.error("Error retrieving users:", error);
      res.status(500).json({ error: "Faield to retrieve users" });
    }
  }

  // *
  // * GET BY ID
  // *
  async getById(req: Request, res: Response) {
    const { userId } = req.params;
    const includeParam = (req.query.include as string) || "";
    const includes = includeParam.split(",").filter(Boolean);

    const includeOrganization = includes.includes("organization");
    const includeSubscription = includes.includes("subscription");
    const includeOrgProfile = includes.includes("orgprofile");
    const includeSeatStats = includes.includes("seatstats");

    try {
      const includeObject: Prisma.UserInclude = {
        teams: { include: { courses: true } },
        assignedCourses: true,
        seat: true,
      };

      if (includeOrganization) {
        includeObject.organization = {
          include: {
            ...(includeSubscription && { subscription: true }),
            ...(includeOrgProfile && { profile: true }),
          },
        };
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: includeObject,
      });

      // Use the consolidated enrichment function
      const enrichedUser = await enrichUser(user, {
        includeCourses: true,
        includeSeatStats: includeSeatStats,
      });

      res.status(200).json({ data: enrichedUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve user" });
    }
  }

  // *
  // * GET USER DATA
  // *
  async getUserData(req: Request, res: Response) {
    const user = req.user as SerializeUser;

    try {
      const userData = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          profileImage: true,
          organization: {
            include: {
              subscription: true,
              profile: true,
            },
          },
          seat: true,
          assignedCourses: true,
          teams: { include: { courses: true } },
          ownedOrganization: true,
          learnifierId: true,
        },
      });

      if (!userData) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      if (!userData?.learnifierId) {
        res.status(500).json({ error: "Can't find learnifier ID" });
        return;
      }

      // const courseLoginLinks = await getCourseData(userData.learnifierId);

      const teamCourses = userData.teams.flatMap((team) => team.courses || []);
      const allCourses = [...userData.assignedCourses, ...teamCourses];
      const uniqueCourses = Array.from(
        new Map(allCourses.map((course) => [course.id, course])).values()
      );

      // const loginLinkMap = new Map(
      //   courseLoginLinks.map(({ projectName, ...rest }) => [projectName, rest])
      // );

      const coursesWithLinks = uniqueCourses.map((course) => {
        return course;
        // const match = loginLinkMap.get(course.name);
        // return {
        //   ...course,
        //   ...(match || {}),
        // };
      });

      res.status(200).json({
        data: {
          ...addFullNameToUser(userData),
          courses: coursesWithLinks,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve user" });
    }
  }

  async getByCourse(req: Request, res: Response) {
    const { courseId } = req.params;
    const { organizationId } = req.query;

    try {
      // Get users directly assigned to the course
      const directlyAssignedUsers = await prisma.user.findMany({
        where: {
          assignedCourses: {
            some: {
              id: courseId,
            },
          },
          ...(organizationId && { organizationId: organizationId as string }),
        },
        include: {
          teams: { include: { courses: true } },
          seat: true,
          assignedCourses: true,
        },
      });

      // Get users assigned via teams
      const teamAssignedUsers = await prisma.user.findMany({
        where: {
          teams: {
            some: {
              courses: {
                some: {
                  id: courseId,
                },
              },
            },
          },
          ...(organizationId && { organizationId: organizationId as string }),
        },
        include: {
          teams: { include: { courses: true } },
          seat: true,
          assignedCourses: true,
        },
      });

      // Combine and remove duplicate users
      const usersMap = new Map();

      [...directlyAssignedUsers, ...teamAssignedUsers].forEach((user) => {
        if (!usersMap.has(user.id)) {
          usersMap.set(user.id, user);
        }
      });

      const users = Array.from(usersMap.values());

      const enrichedUsers = await enrichUsers(users, {
        includeCourses: true,
        includeFullName: true,
      });

      res.status(200).json({
        data: enrichedUsers,
        meta: {
          total: enrichedUsers.length,
          courseId,
          organizationId,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve coaches for course" });
    }
  }

  // *
  // * UPDATE
  // *
  async update(req: Request, res: Response) {
    const user = req.user as SerializeUser;
    const { firstName, lastName, password, profileImage, role } = req.body;
    user.role = role;
    try {
      if (!user.id) return;
      const updatedUser = await updateData(
        user.id,
        {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(password && { password }),
          ...(profileImage && { profileImage }),
          ...(role && { role }),
        },
        "user"
      );

      res.status(200).json({ data: updatedUser });
    } catch {
      res.status(500).json({ error: "Failed to update user" });
    }
  }

  //*
  //* DELETE
  //*
  async delete(req: Request, res: Response) {
    const { userId } = req.params;

    try {
      await prisma.user.delete({ where: { id: userId } });
      res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  }
}

export const userController = new UserController();
