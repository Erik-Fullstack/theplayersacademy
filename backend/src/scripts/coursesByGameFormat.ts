import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const extraCourseIds = [
  'c6ba11d8-724d-427f-8e3c-cc947b706440',
];

async function main() {
  const teams = await prisma.team.findMany({
    select: {
      id: true,
      gameFormatId: true,
    },
  });

  for (const team of teams) {
    if (!team.gameFormatId) {
      console.warn(`Skipping team ${team.id} - no gameFormatId`);
      continue;
    }

    const matchingCourses = await prisma.course.findMany({
      where: {
        gameFormatId: team.gameFormatId,
      },
      select: {
        id: true,
      },
    });


    const allCourseIds = [
      ...new Set([
        ...matchingCourses.map((c) => c.id),
        ...extraCourseIds,
      ]),
    ];

    await prisma.team.update({
      where: { id: team.id },
      data: {
        courses: {
          connect: allCourseIds.map((id) => ({ id })),
        },
      },
    });

    console.log(`Linked ${allCourseIds.length} courses to team ${team.id}`);
  }
}

main()
  .catch((e) => {
    console.error('Error linking courses to teams:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
