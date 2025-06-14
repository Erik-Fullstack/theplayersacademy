/**
 * Generates an array of consecutive integers from start to end (inclusive)
 * 
 * @param {number} start - The starting number of the range
 * @param {number} end - The ending number of the range (inclusive)
 * @returns {number[]} Array of integers from start to end
 * @example
 * // Returns [2006, 2007, 2008, ..., 2018, 2019]
 * const years = generateRange(2006, 2019);
 */
export function generateRange(start: number, end: number): number[] {
  const result: number[] = [];
  
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  
  return result;
}