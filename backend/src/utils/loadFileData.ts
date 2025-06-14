import fs from "fs";
import path from "path";

/**
 * Loads data from a text file with entries separated by new lines.
 * Filters out empty lines and lines starting with "//".
 * 
 * @param {string} filename - The name of the file to load
 * @param {string} [directory] - Optional directory path. If not provided, loads from project root
 * @returns {string[]} An array of strings, each representing one line from the file
 * @example
 * // Load from project root
 * const data = loadFromTxt("config.txt");
 * // Load from specific directory
 * const names = loadFromTxt("firstNames.txt", "prisma/seed_data");
 */
export function loadFromTxt(filename: string, directory?: string): string[] {
  // Start with project root
  const projectRoot = path.resolve(__dirname, "../../");
  
  // Construct file path based on whether directory was provided
  const filePath = directory 
    ? path.join(projectRoot, directory, filename) 
    : path.join(projectRoot, filename);
  
  try {
    // Read the file content and split by new lines
    const fileContent = fs.readFileSync(filePath, "utf-8");
    
    // Split by new line and filter out any empty lines or comments
    return fileContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("//"));
  } catch (error) {
    console.error(`Error reading file ${filename}:`, error);
    return [];
  }
}

/**
 * Loads and parses data from a JSON file.
 * 
 * @template T - The type of data expected from the JSON file
 * @param {string} filename - The name of the file to load
 * @param {string} [directory] - Optional directory path. If not provided, loads from project root
 * @returns {T} The parsed JSON data
 * @throws {Error} If the file cannot be read or parsed
 * @example
 * // Load from specific directory
 * type CourseCreate = Prisma.CourseCreateInput;
 * const courses = loadFromJson<CourseCreate[]>("courses.json", "prisma/seed_data");
 */
export function loadFromJson<T>(filename: string, directory?: string): T {
  // Start with project root
  const projectRoot = path.resolve(__dirname, "../../");
  
  // Construct file path based on whether directory was provided
  const filePath = directory 
    ? path.join(projectRoot, directory, filename) 
    : path.join(projectRoot, filename);
  
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(fileContent) as T;
  } catch (error) {
    console.error(`Error reading JSON file ${filename}:`, error);
    throw error;
  }
}