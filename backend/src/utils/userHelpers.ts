import { prisma } from "../lib/prisma";
import { Course, IUser } from "../types/models";
import { addCourseActivityData } from "./projectUtils";
import { addFullNameToUser } from "./transformers";

// Define a more comprehensive type for the enriched user
interface EnrichmentOptions {
  includeCourses?: boolean;
  includeSeatStats?: boolean;
  includeFullName?: boolean;
}

/**
 * Enriches a user object with additional data based on specified options
 * 
 * @returns The enriched user object
 */
export async function enrichUser(user: any, options: EnrichmentOptions = {}) {
  if (!user) return null;
  
  const { includeCourses = true, includeSeatStats = false, includeFullName = true } = options;
  
  // Create a copy to avoid mutating the original
  let enrichedUser = { ...user };
  
  // Add full name transformation
  if (includeFullName) {
    enrichedUser = addFullNameToUser(enrichedUser);
  }
  
  // Enrich with courses data if requested
  if (includeCourses) {
    enrichedUser = await enrichUserWithCourses(enrichedUser);
  }
  
  // Add seat statistics if requested
  if (includeSeatStats && enrichedUser.organizationId) {
    try {
      // Efficient parallel queries for seat counts
      const [totalSeats, usedSeats] = await Promise.all([
        prisma.seat.count({
          where: { organizationId: enrichedUser.organizationId }
        }),
        prisma.seat.count({
          where: { 
            organizationId: enrichedUser.organizationId,
            userId: { not: null }
          }
        })
      ]);
      
      const availableSeats = totalSeats - usedSeats;
      
      // Add the stats to the organization object if it exists
      if (enrichedUser.organization) {
        enrichedUser.organization = {
          ...enrichedUser.organization,
          seatStats: {
            total: totalSeats,
            used: usedSeats,
            available: availableSeats,
            availabilityPercentage: totalSeats > 0 
              ? Math.round((availableSeats / totalSeats) * 100) 
              : 0
          }
        };
      }
    } catch (error) {
      console.error("Error adding seat stats:", error);
      // Continue without seat stats if there's an error
    }
  }
  
  return enrichedUser;
}

/**
 * Enriches multiple user objects with additional data
 */
export async function enrichUsers(users: any[], options: EnrichmentOptions = {}) {
  // Ensure users is an array before processing
  if (!Array.isArray(users)) {
    console.error("enrichUsers expected an array but received:", typeof users);
    return []; // Return empty array instead of failing
  }
  
  try {
    // Process each user (in parallel for better performance)
    return await Promise.all(users.map(user => enrichUser(user, options)));
  } catch (error) {
    console.error("Error in enrichUsers:", error);
    // Return the original users array if enrichment fails
    return users;
  }
}

/**
 * Helper function specifically for course enrichment
 * Kept separate for backward compatibility and specific course logic
 */
export async function enrichUserWithCourses(user: IUser) {
  if (!user) return user;

  // Create a clone of the user to avoid mutating the original
  const enrichedUser = { ...user };
  const allCourses: Set<string> = new Set();
  const courses: Course[] = [];

  // Add courses from teams
  if (user.teams && Array.isArray(user.teams)) {
    for (const team of user.teams) {
      if (team.courses && Array.isArray(team.courses)) {
        for (const course of team.courses) {
          if (!allCourses.has(course.id)) {
            allCourses.add(course.id);
            courses.push(course);
          }
        }
      }
    }
  }

  // Add directly assigned courses
  if (user.assignedCourses && Array.isArray(user.assignedCourses)) {
    for (const course of user.assignedCourses) {
      if (!allCourses.has(course.id)) {
        allCourses.add(course.id);
        courses.push(course);
      }
    }
  }

  // Add the courses array to the enriched user
  if (user.learnifierId) {
    enrichedUser.courses = await addCourseActivityData(user.learnifierId, courses);
  } else {
    enrichedUser.courses = courses;
  }
  return enrichedUser;
}
