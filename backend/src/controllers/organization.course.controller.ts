import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

// Functions:
// CREATE
// GET ALL
// GET BY ORGANIZATION
// GET BY ID
// UPDATE
// DELETE

export class OrganizationCourseController {
  // *
  // * CREATE
  // *
  async create(req: Request, res: Response) {
    const { courseId, organizationId, introText } = req.body;

    try {
      const newOrgCourse = await prisma.orgCourse.create({
        data: {
          courseId,
          organizationId,
          introText,
        },
        include: {
          course: true,
        },
      });
      
      res.status(201).json({ data: newOrgCourse });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Faield to create organization course" });
    }
  }

  // *
  // * GET ALL
  // *
  async getAll(req: Request, res: Response) {
    try {
      const { org } = req.query;
      const where = org ? { organizationId: org as string } : {};

      const orgCourses = await prisma.orgCourse.findMany({
        where,
        include: {
          course: true,
          organization: true,
        },
      });
      
      res.status(200).json({ 
        data: orgCourses,
        meta: { total: orgCourses.length }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve organization courses" });
    }
  }

  // *
  // * GET BY ORGANIZATION
  // *
  async getByOrganization(req: Request, res: Response) {
    const { orgId } = req.params;

    try {
      const orgCourses = await prisma.orgCourse.findMany({
        where: { organizationId: orgId },
        include: {
          course: true,
          organization: true,
        },
      });
      
      res.status(200).json({ 
        data: orgCourses,
        meta: { total: orgCourses.length }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve organization courses" });
    }
  }

  // *
  // * GET BY ID
  // *
  async getById(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const orgCourse = await prisma.orgCourse.findUnique({
        where: { id },
        include: {
          course: true,
          organization: true,
        },
      });
      
      if (!orgCourse) {
        res.status(404).json({ error: "Organization course not found" });
        return;
      }
      
      res.status(200).json({ data: orgCourse });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve organization course" });
    }
  }

  // *
  // * UPDATE
  // *
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { introText } = req.body;
  
    try {
      const updateData: Prisma.OrgCourseUpdateArgs["data"] = {};
  
      if (introText !== undefined) {
        updateData.introText = introText;
      }
      const updatedOrgCourse = await prisma.orgCourse.update({
        where: { id },
        data: updateData,
      });
  
      res.status(200).json({ data: updatedOrgCourse });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update organization course" });
    }
  }

  // *
  // * DELETE
  // *
  async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await prisma.orgCourse.delete({ where: { id } });
      res.status(200).json({ message: "Organization course deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete organization course" });
    }
  }

  // // *
  // // * ASSIGN USER TO COURSE
  // // *
  // async assignUser(req: Request, res: Response) {
  //   const { id } = req.params;
  //   const { user } = req.body;

  //   try {
  //     const orgCourse = await prisma.orgCourse.findUnique({
  //       where: { id },
  //     });

  //     if (!orgCourse) {
  //       res.status(404).json({ error: "Organization course not found" });
  //       return;
  //     }

  //     // Check if user is already assigned
  //     if (orgCourse.assignedUsers.some(currentUser => currentUser.id === user.id)) {
  //       res.status(409).json({ 
  //         message: `${user.firstName} already has access to this course` 
  //       });
  //       return;
  //     }

  //     // Prepare the updated list of users
  //     const currentUsers = orgCourse.assignedUsers.map(u => ({ id: u.id }));
  //     const updatedUsers = [...currentUsers, { id: user.id }];

  //     // Update the orgCourse with the new user
  //     const updatedOrgCourse = await prisma.orgCourse.update({
  //       where: { id },
  //       data: {
  //         assignedUsers: {
  //           set: updatedUsers
  //         }
  //       },
  //       include: {
  //         assignedUsers: true,
  //         course: true
  //       }
  //     });

  //     res.status(200).json({ 
  //       data: updatedOrgCourse,
  //       message: `User ${user.firstName} was assigned to the course successfully`
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ error: "Failed to assign user to course" });
  //   }
  // }

  // // *
  // // * REMOVE USER FROM COURSE
  // // *
  // async removeUser(req: Request, res: Response) {
  //   const { id, userId } = req.params;

  //   try {
  //     const orgCourse = await prisma.orgCourse.findUnique({
  //       where: { id },
  //       include: {
  //         assignedUsers: {
  //           select: { id: true, firstName: true, lastName: true }
  //         }
  //       }
  //     });

  //     if (!orgCourse) {
  //       res.status(404).json({ error: "Organization course not found" });
  //       return;
  //     }

  //     // Check if user is assigned to this course
  //     const userToRemove = orgCourse.assignedUsers.find(u => u.id === userId);
  //     if (!userToRemove) {
  //       res.status(404).json({ 
  //         error: "User is not assigned to this course" 
  //       });
  //       return;
  //     }

  //     // Prepare the updated list of users (excluding the one to remove)
  //     const updatedUsers = orgCourse.assignedUsers
  //       .filter(u => u.id !== userId)
  //       .map(u => ({ id: u.id }));

  //     // Update the orgCourse without the user
  //     const updatedOrgCourse = await prisma.orgCourse.update({
  //       where: { id },
  //       data: {
  //         assignedUsers: {
  //           set: updatedUsers
  //         }
  //       },
  //       include: {
  //         assignedUsers: true,
  //         course: true
  //       }
  //     });

  //     res.status(200).json({ 
  //       data: updatedOrgCourse,
  //       message: `User ${userToRemove.firstName} ${userToRemove.lastName} was removed from the course successfully`
  //     });
  //   } catch (error) {
  //     res.status(500).json({ error: "Failed to remove user from course" });
  //   }
  // }

  // // *
  // // * GET USERS FOR COURSE
  // // *
  // async getAssignedUsers(req: Request, res: Response) {
  //   const { id } = req.params;

  //   try {
  //     const orgCourse = await prisma.orgCourse.findUnique({
  //       where: { id },
  //       include: {
  //         assignedUsers: true
  //       }
  //     });

  //     if (!orgCourse) {
  //       res.status(404).json({ error: "Organization course not found" });
  //       return;
  //     }

  //     res.status(200).json({ 
  //       data: orgCourse.assignedUsers,
  //       meta: { total: orgCourse.assignedUsers.length }
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ error: "Faield to retrieve course users" });
  //   }
  // }
}

export const organizationCourseController = new OrganizationCourseController();
