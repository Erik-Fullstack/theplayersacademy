import { prisma } from "../lib/prisma";
import { Course, ITeam } from "../types/models";

export const getUserCourses = async (userId: string) => {
  try {
    const userData = await prisma.user.findFirst({
      where: { id: userId },
      include: { teams: { include: { courses: true } } },
    });

    return userData;
  } catch (error) {
    console.error(error);
    throw new Error("Unknown error");
  }
};

export const getUniqueLearnifierIdsByGenderYear = (
  teams: ITeam[],
  targetGender: string,
  targetYear: number
): string[] => {


  const target = teams.find((team: ITeam) => team.gender === targetGender && team.year === targetYear);
  if (!target) throw new Error(`No team found with gender "${targetGender}" and year "${targetYear}"`);

  const targetIds = new Set(target.courses.map((course: Course) => course.learnifierId));
  const otherIds = new Set(
    teams
      .filter(team => team !== target)
      .flatMap(team => team.courses.map(course => course.learnifierId))
  );

  return [...targetIds].filter(id => id && !otherIds.has(id));
};