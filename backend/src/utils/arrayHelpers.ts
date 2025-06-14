/**
 * Returns random item(s) from the provided array.
 * 
 * @param {string[]} array - The array to pick random items from
 * @param {number} [amount=1] - Number of random items to return
 * @returns {string|string[]} A single string if amount is 0, otherwise an array of strings
 * @remarks
 * - If amount is 0, it defaults to 1
 * - When amount is 0, returns a single string instead of an array
 * @example
 * // Get a single random first name
 * const firstName = getRandom(firstNames, 0) as string;
 * 
 * // Get 3 random last names
 * const lastNames = getRandom(lastNames, 3) as string[];
 */
export function getRandomArrayItems<T>(array: T[], amount: number = 1): T | T[] {
  if (amount === 0) amount = 1;
  const returnData: T[] = [];

  for (let i = 0; i < amount; i++) {
    const randomArrayItem = array[Math.floor(Math.random() * array.length)];
    returnData.push(randomArrayItem);
  }

  return amount === 1 ? returnData[0] : returnData;
}
