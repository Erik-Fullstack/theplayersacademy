import { prisma } from "../lib/prisma";

export const getGameFormatByBirthYear = async (year: number) => {
  const currentYear = new Date().getFullYear();
  const playerAge = currentYear - year;

  const gameFormats = await prisma.gameFormat.findMany();

  const gameFormat = gameFormats.find(format => format.ages.includes(playerAge));
  return gameFormat || null;
}