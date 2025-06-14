// run command: npx prisma db seed
// to seed the data to the database

import { PrismaClient, Prisma, Course, User } from "@prisma/client";

import { generateCode } from "../src/utils/generateInvCode";
import { loadFromTxt, loadFromJson } from "../src/utils/loadFileData";
import { getRandomArrayItems } from "../src/utils/arrayHelpers";
import { generateRange } from "../src/utils/numberHelpers";
import { getGameFormatByBirthYear } from "../src/utils/calculateTeamFormat";

const prisma = new PrismaClient();

/*
ADJUSTABLE PARAMETERS
*/
// Adjust this to desired amount of organizations to generate
const ORGS_AMOUNT = 5;
// Change this to the [min, max] amount of users that should be generated per organization
const USER_AMOUNT_RANGE = [30, 75];
// Available subscription models
const SEAT_LIMIT_OPTIONS = [25, 50, 75, 100, 125, 150];
// Invite code amount options
const INVITE_CODE_OPTIONS = [0, 1, 5, 10, 15, 25, 30, 45, 50, 75];
// Where the seed data to pull from is stored
const DATA_LOCATION = "prisma/seed_data";

// Data to pull from to generate random values
const genData = {
  organizations: loadFromTxt("organizations.txt", DATA_LOCATION),
  firstNames: loadFromTxt("firstNames.txt", DATA_LOCATION),
  lastNames: loadFromTxt("lastNames.txt", DATA_LOCATION),
  passwords: loadFromTxt("passwords.txt", DATA_LOCATION),
  colors: loadFromTxt("colors.txt", DATA_LOCATION),
};

// Load courses from JSON
type CourseCreate = Prisma.CourseCreateInput;
const courses = loadFromJson<CourseCreate[]>("courses.json", DATA_LOCATION);

// Load game formats from JSON
type GameFormatCreate = Prisma.GameFormatCreateInput;
const gameFormats = loadFromJson<GameFormatCreate[]>(
  "gameFormats.json",
  DATA_LOCATION
);

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

/**
 * Main function for database seeding.
 * Creates courses, organizations, and users with random data.
 *
 * @returns {Promise<void>}
 */
async function main(): Promise<void> {
  // Get ORGS_AMOUNT random organization names from list
  const organizations = getRandomArrayItems(genData.organizations, ORGS_AMOUNT);

  // Create game formats
  for (const format of gameFormats) {
    const existingFormat = await prisma.gameFormat.findFirst({
      where: { name: format.name },
    });

    if (!existingFormat) {
      const newFormat = await prisma.gameFormat.create({
        data: {
          name: format.name,
          ages: format.ages,
        },
      });
    }
  }

  // Create a superadmin
  const superadminUserData = generateUserData();
  const superadminUser = await prisma.user.upsert({
    where: {
      email: superadminUserData.email,
    },
    update: {},
    create: {
      email: superadminUserData.email,
      firstName: superadminUserData.firstName,
      lastName: superadminUserData.lastName,
      role: "SUPERADMIN",
    },
  });

  // Create courses
  // Save them in an array to create orgCourses later
  let savedCourses: Course[] = [];

  for (const course of courses) {
    const existingCourse = await prisma.course.findFirst({
      where: { name: course.name },
    });

    if (!existingCourse) {
      const formatName = (() => {
        if (!course.format) return "";
        if (typeof course.format === "string") return course.format;
        // Handle case where format might be from JSON with different structure
        return (course.format as any).name || "";
      })();

      const existingFormat = await prisma.gameFormat.findFirst({
        where: { name: formatName },
      });

      const newCourse = await prisma.course.create({
        data: {
          name: course.name,
          description: course.description,
          learnifierId: course.learnifierId || "default-id",
          // Instead of directly using "format", use proper connection syntax
          ...(existingFormat ? { gameFormatId: existingFormat.id } : {}),
        },
      });

      savedCourses.push(newCourse);
    }
  }

  // Loop through the list of organizations to create
  for (const org of organizations) {
    // Generate a random int amount of users based on values in USER_AMOUNT_RANGE
    const randomUserAmount = Math.floor(
      Math.random() * (USER_AMOUNT_RANGE[1] - USER_AMOUNT_RANGE[0] + 1) +
        USER_AMOUNT_RANGE[0]
    );

    // Check if organization exists first
    const existingOrganization = await prisma.organization.findUnique({
      where: { name: org },
      include: {
        profile: true,
        subscription: true,
      },
    });

    // If the organization doesn't exist, create a new one:
    if (!existingOrganization) {
      // Pick a random subscription model
      const seatLimit = getRandomArrayItems(SEAT_LIMIT_OPTIONS, 0) as number;
      // Generate random user data for the admin
      const adminUserData = generateUserData();

      // Create an admin for the organization
      const adminUser = await prisma.user.upsert({
        where: {
          email: adminUserData.email,
        },
        update: {},
        create: {
          email: adminUserData.email,
          firstName: adminUserData.firstName,
          lastName: adminUserData.lastName,
          role: "ADMIN",
        },
      });

      // Create the organization
      const organization = await prisma.organization.create({
        data: {
          name: org,
          ownerId: adminUser.id,
          profile: {
            create: {
              logo: "logo.png",
              colors: JSON.stringify(getRandomArrayItems(genData.colors, 2)),
              introText: "Välkommen till vår förening!",
            },
          },
          subscription: {
            create: {
              seatLimit,
              status: "ACTIVE",
              paymentInfo: "stripe_info",
            },
          },
        },
      });

      // Assign organization to admin user
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { organizationId: organization.id },
      });

      let occupiedSeats = 0; // Keep track of how many seats are occupied

      // Create invite codes for an organization
      const randomCodeAmount = getRandomArrayItems(INVITE_CODE_OPTIONS, 0) as number;

      for (let i = 0; i < randomCodeAmount; i++) {
        let randomUserData;
        let existingInvitation;

        do {
          randomUserData = generateUserData();
          // Check if an invitation with email already exists
          existingInvitation = await prisma.invitationCode.findUnique({
            where: { email: randomUserData.email },
          });
        } while (existingInvitation);

        // Generate unique code
        let inviteCode = "";

        while (!inviteCode) {
          const tempCode = generateCode(10);
          const existingCode = await prisma.invitationCode.findUnique({
            where: { code: tempCode },
          });
          if (!existingCode) inviteCode = tempCode;
        }

        const invitationCode = await prisma.invitationCode.create({
          data: {
            organizationId: organization.id,
            email: randomUserData.email,
            code: inviteCode,
          },
        });
      }

      // Create orgCourses from all available courses
      for (const course of savedCourses) {
        const orgCourse = await prisma.orgCourse.create({
          data: {
            courseId: course.id,
            organizationId: organization.id,
            introText: course.description,
            allAccess: course.name === "Spelarutbildningsplan"
          },
        });
      }

      // Generate random amount (within provided range) of users that belong to the organization
      for (let i = 0; i < randomUserAmount; i++) {
        // Generate random user data
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
        // Higher probability (70%) of getting a seat if there are plenty available
        // Lower probability (30%) if we're getting close to the limit
        const seatFillRatio = occupiedSeats / seatLimit;
        const seatProbability = seatFillRatio < 0.7 ? 0.7 : 0.3;

        // Assign user to a seat if there are seats available
        const existingSeat = await prisma.seat.findUnique({
          where: { userId: regularUser.id },
        });

        if (!existingSeat && occupiedSeats < seatLimit && Math.random() < seatProbability) {
          await prisma.seat.create({
            data: {
              organizationId: organization.id,
              userId: regularUser.id,
            },
          });
          occupiedSeats++;
        }
      }

      // Create remaining empty seats up to the seat limit
      const totalSeats = await prisma.seat.count({
        where: { organizationId: organization.id }
      });

      // Create empty seats up to the limit
      const remainingSeats = seatLimit - totalSeats;
      if (remainingSeats > 0) {
        for (let i = 0; i < remainingSeats; i++) {
          await prisma.seat.create({
            data: {
              organizationId: organization.id,
              // userId is not set, so this will be an empty seat
            }
          });
        }
      }

      // Create teams
      const genders = ["Pojkar", "Flickor"];
      const yearsRange = generateRange(2006, 2019);
      const coachRange = [1, 3];

      // Get all coaches for the organization
      const availableCoaches = await prisma.user.findMany({
        where: {
          organizationId: organization.id,
          role: "USER",
        },
      });

      let remainingCoaches = [...availableCoaches];

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
          const randomIndex = Math.floor(
            Math.random() * remainingCoaches.length
          );
          selectedCoaches.push(remainingCoaches[randomIndex]);
          // Remove the selected coach from available pool
          remainingCoaches.splice(randomIndex, 1);
        }

        try {
          const team = await prisma.$transaction(async (tx) => {
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
            return await tx.team.update({
              where: { id: newTeam.id },
              data: {
                // Connect coaches if there are any
                ...(selectedCoaches.length > 0
                  ? {
                      coaches: {
                        connect: selectedCoaches.map((coach) => ({
                          id: coach.id,
                        })),
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
          });
        } catch (error) {
          // Put the coaches back in the pool if team creation fails
          remainingCoaches.push(...selectedCoaches);
        }
      }
    }
  }

  console.log("Database has been seeded.");
}

/**
 * Entry point for the seed script.
 * Executes the main function and handles any errors.
 */
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
