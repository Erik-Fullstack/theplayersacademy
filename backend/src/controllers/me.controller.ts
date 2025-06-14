import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { getCourseData } from "../utils/projectUtils";
import { ITeam, SerializeUser } from "../types/models";
import { enrichUser } from "../utils/userHelpers";
import { Prisma } from "@prisma/client";

export const getMe = async (req: Request, res: Response) => {
  const { id } = req.user as SerializeUser;

  try {
    const includeParam = (req.query.include as string) || "";
    const includes = includeParam.split(",").filter(Boolean);

    const includeOrganization = includes.includes("organization");
    const includeSubscription = includes.includes("subscription");
    const includeOrgProfile = includes.includes("orgprofile");
    const includeSeatStats = includes.includes("seatstats");

    const includeObject: Prisma.UserInclude = {
      teams: { include: { courses: true } },
      assignedCourses: true,
      seat: true,
      ...(includeOrganization && {
        organization: {
          include: {
            ...(includeSubscription && { subscription: true }),
            ...(includeOrgProfile && { profile: true }),
          },
        },
      }),
    };

    const user = await prisma.user.findUnique({
      where: { id },
      include: includeObject,
    });

    if (!user) {
      res.status(404).json({ error: "Unable to find user." });
      return;
    }

    // Use the consolidated enrichment function
    const enrichedUser = await enrichUser(user, {
      includeCourses: true,
      includeSeatStats: includeSeatStats,
    });
    if (!enrichedUser || !enrichedUser.learnifierId) {
      res.status(404).json({ error: "Unable to find learnifier id for user." });
      return;
    }

    // const courseLoginLinks = await getCourseData(enrichedUser.learnifierId);

    const teamCourses = enrichedUser.teams
      ? enrichedUser.teams.flatMap((team: ITeam) => team.courses || [])
      : [];
    const allCourses = [...enrichedUser.assignedCourses, ...teamCourses];
    const uniqueCourses = Array.from(
      new Map(
        allCourses.map((course) => [course.learnifierId, course])
      ).values()
    );

    // const loginLinkMap = new Map(
    //   courseLoginLinks.map(({ learnifierId, ...rest }) => [
    //     String(learnifierId),
    //     rest,
    //   ])
    // );

    const coursesWithLinks = uniqueCourses.map((course) => {
      return course;
      // const match = loginLinkMap.get(String(course.learnifierId));
      // return {
      //   ...course,
      //   ...(match || {}),
      // };
    });

    res
      .status(200)
      .json({ data: { ...enrichedUser, courses: coursesWithLinks } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve user" });
  }
};

export const updateMe = async (req: Request, res: Response) => {
  const { id } = req.user as SerializeUser;
  const { firstName, lastName, password, profileImage, role } = req.body;

  try {
    // Build the update data object
    const updateData: any = {};

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (password !== undefined) updateData.password = password;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (role !== undefined) updateData.role = role;

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: "No fields provided for update" });
      return;
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        teams: { include: { courses: true } },
        assignedCourses: true,
        seat: true,
        organization: {
          include: {
            subscription: true,
            profile: true,
          },
        },
      },
    });

    // Enrich the user data (same as in getMe)
    const enrichedUser = await enrichUser(updatedUser, {
      includeCourses: true,
      includeSeatStats: true,
    });

    if (!enrichedUser || !enrichedUser.learnifierId) {
      res.status(404).json({ error: "Unable to find learnifier id for user." });
      return;
    }

    // const courseLoginLinks = await getCourseData(enrichedUser.learnifierId);

    const teamCourses = enrichedUser.teams
      ? enrichedUser.teams.flatMap((team: ITeam) => team.courses || [])
      : [];
    const allCourses = [...enrichedUser.assignedCourses, ...teamCourses];
    const uniqueCourses = Array.from(
      new Map(
        allCourses.map((course) => [course.learnifierId, course])
      ).values()
    );

    // const loginLinkMap = new Map(
    //   courseLoginLinks.map(({ learnifierId, ...rest }) => [
    //     String(learnifierId),
    //     rest,
    //   ])
    // );

    const coursesWithLinks = uniqueCourses.map((course) => {
      return course;
      // const match = loginLinkMap.get(String(course.learnifierId));
      // return {
      //   ...course,
      //   ...(match || {}),
      // };
    });

    res.status(200).json({
      data: { ...enrichedUser, courses: coursesWithLinks },
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};
