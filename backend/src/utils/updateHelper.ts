/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../lib/prisma";

/**
 * A helper function to update a record in any given table in the Prisma schema.
 * 
 * This function dynamically selects the model (table) based on the provided `table` argument
 * and updates the corresponding record with the given `id` and `args` (the data to be updated).
 * 
 * @param {string} id - The unique identifier of the record to be updated.
 * @param {Record<string, any>} args - The fields and their new values to update. The keys are field names,
 * and the values are the new values to set for those fields.
 * @param {keyof typeof prisma} table - The table (model) to update, selected from the Prisma client.
 * 
 * @returns {Promise<Object>} - The updated record returned from Prisma, or throws an error if update fails.
 * 
 * @throws {Error} - Throws an error if the update operation fails.
 */

export const updateData = async (
    id: string,
    args: Record<string, any>,
    table: keyof typeof prisma
  ): Promise<object> => {
    

    const data = Object.entries(args).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[key] = value;
      return acc;
    }, {} as Record<string, any>);

    if(Object.keys(data).length === 0) throw new Error("No update fields were provided.")
  
    try {
      const updatedData = await (prisma[table] as any).update({
        where: { id },
        data,
      });

      return updatedData;
    } catch (error: any) {
      console.error("Update error:", error);
      throw new Error(error?.message || "Unknown error occurred");
    }
  };
  
