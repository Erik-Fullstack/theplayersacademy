import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { updateData } from "../utils/updateHelper";

// Functions:
// CREATE
// GET ALL
// GET BY ID
// GET COURSE STATS
// UPDATE
// DELETE
// ASSIGN USER TO COURSE
// REMOVE USER FROM COURSE
// GET USERS FOR COURSE

export class CourseController {
  // *
  // * CREATE
  // *
  async create(req: Request, res: Response) {
    const {
      name,
      description,
      learnifierId
    } = req.body;

    try {
      const course = await prisma.course.create({
        data: { 
          name, 
          description, 
          learnifierId
        }
      });
      
      res.status(201).json({ data: course });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create course" });
    }
  }

  // *
  // * GET ALL
  // *
  async getAll(req: Request, res: Response) {
    try {
      const courses = await prisma.course.findMany();
      
      res.status(200).json({ 
        data: courses,
        meta: { total: courses.length }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve courses" });
    }
  }

  // *
  // * GET BY ID
  // *
  async getById(req: Request, res: Response) {
    const { courseId } = req.params;

    try {
      const course = await prisma.course.findUnique({ 
        where: { id: courseId } 
      });
      
      if (!course) {
        res.status(404).json({ error: "Course not found" });
        return;
      }
      
      res.status(200).json({ data: course });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve course" });
    }
  }

  // *
  // * GET COURSE STATS
  // *
  async getCourseStats(req: Request, res: Response) {
    const { orgId } = req.params;
    
    try {
      const courses = await prisma.orgCourse.findMany({
        where: { organizationId:orgId },
        include: { course: true }
      });
      
      const courseStats = await Promise.all(
        courses.map(async (course) => {
          const teamCount = await prisma.team.count({
            where: {
              organizationId: orgId,
              courses: { some: { id: course.courseId } }
            }
          });
          
          const coachCount = await prisma.user.count({
            where: {
              organizationId: orgId,
              OR: [
                { assignedCourses: { some: { id: course.courseId } } },
                { teams: { some: { courses: { some: { id: course.courseId } } } } }
              ]
            }
          });
          
          return {
            courseId: course.courseId,
            teamCount,
            coachCount
          };
        })
      );
      
      res.status(200).json({
        data: courseStats
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve course statistics" });
    }
  }

  // *
  // * UPDATE
  // *
  async update(req: Request, res: Response) {
    const { courseId } = req.params;
    const { name, description, learnifierId, gameFormatId } = req.body;

    try { 
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      });
      
      if (!course) {
        res.status(404).json({ error: "Course not found" });
        return;
      }
      
      const updatedCourse = await updateData(
        courseId, 
        { name, description, learnifierId, gameFormatId }, 
        "course"
      );
      
      res.status(200).json({ data: updatedCourse });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update course" });
    }
  }

  // *
  // * DELETE
  // *
  async delete(req: Request, res: Response) {
    const { courseId } = req.params;

    try {
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      });
      
      if (!course) {
        res.status(404).json({ error: "Course not found" });
        return;
      }
      
      await prisma.course.delete({ where: { id: courseId } });
      res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete course" });
    }
  }

  // *
  // * ASSIGN USER TO COURSE
  // *
  async assignUser(req: Request, res: Response) {
    const { courseId } = req.params;
    const { userId } = req.body;

    try {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { assignedUsers: true }
      });

      if (!course) {
        res.status(404).json({ error: "Course not found" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, firstName: true, lastName: true }
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      // Check if user is already assigned
      if (course.assignedUsers.some(u => u.id === userId)) {
        res.status(409).json({ 
          message: `User already has access to this course` 
        });
        return;
      }

      // Add the user to the course
      const updatedCourse = await prisma.course.update({
        where: { id: courseId },
        data: {
          assignedUsers: {
            connect: { id: userId }
          }
        },
        include: {
          assignedUsers: true,
        }
      });

      res.status(200).json({ 
        data: updatedCourse,
        message: `User was assigned to the course successfully`
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to assign user to course" });
    }
  }

  // *
  // * REMOVE USER FROM COURSE
  // *
  async removeUser(req: Request, res: Response) {
    const { courseId, userId } = req.params;

    try {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          assignedUsers: {
            select: { id: true, firstName: true, lastName: true }
          }
        }
      });

      if (!course) {
        res.status(404).json({ error: "Course not found" });
        return;
      }

      // Check if user is assigned to this course
      const userToRemove = course.assignedUsers.find(u => u.id === userId);
      if (!userToRemove) {
        res.status(404).json({ 
          error: "User is not assigned to this course" 
        });
        return;
      }

      // Prepare the updated list of users (excluding the one to remove)
      const updatedUsers = course.assignedUsers
        .filter(u => u.id !== userId)
        .map(u => ({ id: u.id }));

      // Update the orgCourse without the user
      const updatedCourse = await prisma.course.update({
        where: { id: courseId },
        data: {
          assignedUsers: {
            set: updatedUsers
          }
        },
        include: {
          assignedUsers: true,
        }
      });

      res.status(200).json({ 
        data: updatedCourse,
        message: `User ${userToRemove.firstName} ${userToRemove.lastName} was removed from the course successfully`
      });
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: "Failed to remove user from course" });
    }
  }

  // *
  // * GET USERS FOR COURSE
  // *
  async getAssignedUsers(req: Request, res: Response) {
    const { courseId } = req.params;
    const { org: orgId } = req.query;

  try {
    // First check if the course exists
    const courseExists = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true }
    });

    if (!courseExists) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    const users = await prisma.user.findMany({
      where: {
        // Filter by organization if specified
        ...(orgId ? { organizationId: orgId as string } : {}),
        // Get users where this course is in their assignedCourses
        assignedCourses: {
          some: { id: courseId }
        }
      },
    });

    res.status(200).json({
      data: users,
      meta: {
        total: users.length,
        filters: { orgId: orgId || null }
      }
    });
  } catch (error) {
    console.error("Error retrieving course users:", error);
    res.status(500).json({ error: "Failed to retrieve course users" });
  }
  }
}

export const courseController = new CourseController();
