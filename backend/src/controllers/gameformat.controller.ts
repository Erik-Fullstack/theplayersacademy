import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// Functions:
// GET ALL
// GET BY ID

export class GameFormatController {
  // *
  // * GET ALL
  // *
  async getAll(req: Request, res: Response) {
    try {
      const formats = await prisma.gameFormat.findMany();
      res.status(200).json({ data: formats });
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: "Failed to retrieve game formats" });
    }
  }

  // *
  // * GET BY ID
  // *
  async getById(req: Request, res: Response) {
    const { formatId } = req.params;

    try {
      const format = await prisma.gameFormat.findUnique({ where: { id: formatId } });
      
      if (!format) {
        res.status(404).json({ error: "Game format not found" });
        return;
      }

      res.status(200).json({ data: format });
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: "Failed to retrieve game format" });
    }
  }
}

export const gameFormatController = new GameFormatController();
