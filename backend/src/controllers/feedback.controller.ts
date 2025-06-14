import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// Functions:
// CREATE
// GET ALL
// GET BY ID
// RESOLVE
// DELETE

export class FeedbackController {
  // *
  // * CREATE
  // *
  async create(req: Request, res: Response) {
    const { userId, email, category, message, rating } = req.body;

    if (!category || !message || !rating) {
      res
        .status(400)
        .json({ error: "Category, message and rating are required." });
      return;
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      res.status(400).json({ error: "Rating must be a number between 1 and 5." });
      return;
    }
    try {
      const feedback = await prisma.feedback.create({
        data: {
          userId,
          email,
          category,
          message,
          rating,
        },
      });

      res.status(200).json({ data: feedback });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create feedback" });
    }
  }

  // *
  // * GET ALL
  // *
  async getAll(req: Request, res: Response) {
  try {
    const feedback = await prisma.feedback.findMany();

    res.status(200).json({
      data: feedback,
      meta: { total: feedback.length }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve feedback" });
  }
};

  // *
  // * GET BY ID
  // *
  async getById(req: Request, res: Response) {
  const { feedbackId } = req.params;

  try {
    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
    });

    if (!feedback) {
      res.status(404).json({ error: "Feedback not found" });
      return;
    }

    res.status(200).json({ data: feedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve feedback" });
  }
};

  //*
  //* RESOLVE
  //*
  async resolve(req: Request, res: Response) {
    const { feedbackId } = req.params;
    try {
      const resolvedFeedback = await prisma.feedback.update({
        where: { id: feedbackId },
        data: { isResolved: true },
      });

      res.status(200).json({ data: resolvedFeedback });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to resolve feedback" });
    }
  };

  //*
  //* DELETE
  //*
  async delete(req: Request, res: Response) {
    const { feedbackId } = req.params;
    try {
      const deletedFeedback = await prisma.feedback.delete({
        where: { id: feedbackId },
      });

      res.status(200).json({
        data: deletedFeedback,
        message: "Feedback deleted successfully."
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete feedback" });
    }
  };
}

export const feedbackController = new FeedbackController();
