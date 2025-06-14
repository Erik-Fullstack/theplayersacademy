import { prisma } from "../lib/prisma";
import { generateRange } from "./numberHelpers";
import { loadFromTxt } from "./loadFileData";
import { Course, User } from "@prisma/client";
import { getRandomArrayItems } from "./arrayHelpers";
import { getGameFormatByBirthYear } from "./calculateTeamFormat";
import { addUserToProject } from "./projectUtils";
import { IUser } from "../types/models";


export interface IOrganization {
  id: string;
  subscription: {
    seatLimit: number;
  };
}

export const generateUsersForOrg = async (organization: IOrganization, admin: IUser) => {
  let occupiedSeats = 0;
  const randomUserAmount = 30;
  

  const courses = await prisma.course.findMany({});

  for (const course of courses) {
    await prisma.orgCourse.create({
      data: {
        courseId: course.id,
        organizationId: organization.id,
        introText: course.description,
        allAccess: course.name === "Spelarutbildningsplan",
      },
    });
  }
  const userPromises = Array.from({ length: randomUserAmount }).map(async () => {
    const regularUserData = generateUserData();
  
    const regularUser = await prisma.user.upsert({
      where: {
        email: regularUserData.email,
      },
      update: {},
      create: {
        email: regularUserData.email,
        firstName: regularUserData.firstName,
        lastName: regularUserData.lastName,
        role: "USER",
        organizationId: organization.id,
      },
    });
  
    // Randomize whether this user gets a seat
    const seatProbability = 0.7
  
    const existingSeat = await prisma.seat.findUnique({
      where: { userId: regularUser.id },
    });
  
    // Update occupiedSeats in a thread-safe way
    if (
      !existingSeat &&
      Math.random() < seatProbability
    ) {
      return {
        userId: regularUser.id,
        shouldAssignSeat: true,
      };
    }
  
    return {
      userId: regularUser.id,
      shouldAssignSeat: false,
    };
  });
  
  const userResults = await Promise.all(userPromises);
  
  // Filter users who should receive seats and assign only until seat limit is reached
  for (const result of userResults) {
    if (
      result.shouldAssignSeat &&
      occupiedSeats < organization.subscription!.seatLimit
    ) {
      await prisma.seat.create({
        data: {
          organizationId: organization.id,
          userId: result.userId,
        },
      });
      occupiedSeats++;
    }
  }

  await prisma.seat.create({
    data: {
      organizationId: organization.id,
      userId: admin.id,
    },
  });

  // Create remaining empty seats up to the seat limit
  const totalSeats = await prisma.seat.count({
    where: { organizationId: organization.id },
  });

  // Create empty seats up to the limit
  const remainingSeats = organization.subscription!.seatLimit - totalSeats;
  if (remainingSeats > 0) {
    for (let i = 0; i < remainingSeats; i++) {
      await prisma.seat.create({
        data: {
          organizationId: organization.id,
          // userId is not set, so this will be an empty seat
        },
      });
    }
  }



  // Get all coaches for the organization
  const availableCoaches = await prisma.user.findMany({
    where: {
      organizationId: organization.id,
      role: "USER",
    },
  });

  const remainingCoaches = [...availableCoaches];

  // Create teams
  const genders = ["Pojkar", "Flickor"];
  const yearsRange = generateRange(2006, 2019);
  const coachRange = [1, 3];

  // Create all possible team combinations
  const possibleTeams: { gender: string; year: number }[] = [];
  for (const gender of genders) {
    for (const year of yearsRange) {
      possibleTeams.push({ gender, year });
    }
  }

  // Shuffle the possible teams to randomize creation order
  const shuffledTeams = [...possibleTeams].sort(() => Math.random() - 0.5);

  // Track created teams to prevent duplicates
  const createdTeamKeys = new Set();

  // Create teams until there are no more coaches
  for (const teamInfo of shuffledTeams) {
    // Generate a unique key for this team
    const teamKey = `${teamInfo.gender}-${teamInfo.year}`;

    // Skip if this team already exists
    if (createdTeamKeys.has(teamKey)) continue;

    // Generate random number of coaches needed
    const coachesNeeded =
      Math.floor(Math.random() * (coachRange[1] - coachRange[0] + 1)) +
      coachRange[0];

    // Check if there are enough coaches left
    if (remainingCoaches.length < coachesNeeded) break;

    // Select random coaches from remaining pool
    const selectedCoaches: User[] = [];
    for (let i = 0; i < coachesNeeded; i++) {
      const randomIndex = Math.floor(Math.random() * remainingCoaches.length);
      selectedCoaches.push(remainingCoaches[randomIndex]);
      // Remove the selected coach from available pool
      remainingCoaches.splice(randomIndex, 1);
    }

    try {
      await prisma.$transaction(async (tx) => {
        const gameFormat = await getGameFormatByBirthYear(teamInfo.year);

        // Create the team
        const newTeam = await tx.team.create({
          data: {
            organizationId: organization.id,
            year: teamInfo.year,
            gender: teamInfo.gender,
            gameFormatId: gameFormat?.id,
          },
        });

        // Mark this team as created
        createdTeamKeys.add(teamKey);

        // Find courses that match the game format
        let matchingCourses: Course[] = [];
        if (gameFormat) {
          matchingCourses = await tx.course.findMany({
            where: {
              gameFormatId: gameFormat.id,
            },
          });
        }

        // Now update the team with both coaches and courses
        const createdTeam =  await tx.team.update({
          where: { id: newTeam.id },
          data: {
            // Connect coaches if there are any
            ...(selectedCoaches.length > 0
              ? {
                  coaches: {
                    connect: [
                      ...selectedCoaches.map((coach) => ({ id: coach.id })),
                      ...(admin ? [{ id: admin.id }] : []),
                    ],
                  },
                }
              : {}),

            // Connect matching courses if there are any
            ...(matchingCourses.length > 0
              ? {
                  courses: {
                    connect: matchingCourses.map((course) => ({
                      id: course.id,
                    })),
                  },
                }
              : {}),
          },
          include: {
            coaches: true,
            courses: true,
            gameFormat: true,
          },
        });
        await addUserToProject({user:admin, team:createdTeam})
      });





      // const teams = await prisma.team.findMany({
      //   where: { organizationId: organization.id },
      // });
    
    } catch (error) {
      // Put the coaches back in the pool if team creation fails
      console.error(error)
      remainingCoaches.push(...selectedCoaches);
    }
  }
};


const DATA_LOCATION = "prisma/seed_data";

// Data to pull from to generate random values
const genData = {
  organizations: loadFromTxt("organizations.txt", DATA_LOCATION),
  firstNames: loadFromTxt("firstNames.txt", DATA_LOCATION),
  lastNames: loadFromTxt("lastNames.txt", DATA_LOCATION),
  passwords: loadFromTxt("passwords.txt", DATA_LOCATION),
  colors: loadFromTxt("colors.txt", DATA_LOCATION),
};

// Generate user data with random values
export function generateUserData() {
  const firstName = getRandomArrayItems(genData.firstNames, 0) as string;
  const lastName = getRandomArrayItems(genData.lastNames, 0) as string;
  const password = getRandomArrayItems(genData.passwords, 0) as string;

  return {
    firstName,
    lastName,
    password,
    email: `${firstName}.${lastName}@email.com`.toLowerCase(),
    // todo: remove åäö etc. from email?
  };
}
