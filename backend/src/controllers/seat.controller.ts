import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { addUserToProject, removeUserFromProjects } from "../utils/projectUtils";
import { IUser } from "../types/models";
import { SeatResponse } from "../types/responses";
import { Prisma } from "@prisma/client";
import {
  participationList,
  removeUserFromProject,
} from "../utils/projectUtils";
import { enrichUser } from "../utils/userHelpers";

// Functions:
// GET BY ORGANIZATION
// GET BY ID
// UPDATE

export class SeatController {
  // *
  // * GET BY ORGANIZATION
  // *
  async getByOrganization(req: Request, res: Response) {
    const { orgId } = req.params;
    const { hasUser, userId, available } = req.query;

    try {
      const seatWhere: any = { organizationId: orgId };

      if (available === "true") {
        seatWhere.userId = null;
      }

      if (hasUser === "true") {
        seatWhere.userId = { not: null };
      } else if (hasUser === "false") {
        seatWhere.userId = null;
      }

      if (userId) {
        seatWhere.userId = userId;
      }

      // First get all seats with their basic user data
      const seats = await prisma.seat.findMany({
        where: seatWhere,
        include: {
          user: true,
          organization: true,
        },
      });

      // Now enrich the user objects in each seat
      const enrichedSeats = await Promise.all(
        seats.map(async (seat) => {
          if (seat.user) {
            // Enrich the user with fullName and any other needed properties
            const enrichedUser = await enrichUser(seat.user, {
              includeFullName: true,
              includeSeatStats: false,
              includeCourses: false,
            });

            return {
              ...seat,
              user: enrichedUser,
            };
          }
          return seat;
        })
      );

      // Count total and available seats
      const [allSeats, usedSeats] = await Promise.all([
        prisma.seat.count({
          where: { organizationId: orgId },
        }),
        prisma.seat.count({
          where: {
            organizationId: orgId,
            userId: { not: null },
          },
        }),
      ]);

      const availableSeatsCount = allSeats - usedSeats;

      res.status(200).json({
        data: enrichedSeats,
        meta: {
          total: enrichedSeats.length,
        data: enrichedSeats,
        meta: {
          total: enrichedSeats.length,
          allSeats,
          availableSeats: availableSeatsCount,
          assignedSeats: usedSeats,
        },
          availableSeats: availableSeatsCount,
          assignedSeats: usedSeats,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve organization seats" });
    }
  }

  // *
  // * GET BY ID
  // *
  async getById(req: Request, res: Response) {
    const { orgId, seatId } = req.params;

    try {
      const response = await prisma.organization.findUnique({
        where: { id: orgId },
        include: {
          seats: {
            where: { id: seatId },
          },
        },
      });

      if (!response || response.seats.length === 0) {
        res
          .status(404)
          .json({ error: "Seat not found for this organization." });
        return;
      }

      res.status(200).json({ data: response });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve seat" });
    }
  }

  // *
  // * UPDATE
  // *
  async update(req: Request, res: Response) {
    const { orgId, seatId } = req.params;
    const { userId } = req.body;

    try {
      const org = await prisma.organization.findUnique({
        where: { id: orgId },
        include: {
          seats: {
            where: { id: seatId },
            include: { user: true },
          },
        },
      });

      const seat = org?.seats[0];

      if (!seat) {
        res.status(404).json({ error: "Seat not found for this organization" });
        return;
      }

      // If removing a user from a seat
      if (userId === "") {
        try {
          // Try to remove user from Learnifier projects if they exist
          if (seat.user) {
            const learnifierId = seat.user.learnifierId;

            // Only attempt Learnifier API operations if the user has a learnifierId
            if (learnifierId) {
              try {
                const list = await participationList(learnifierId);
                if (list && Array.isArray(list)) {
                  // Process each project participation
                  await Promise.all(
                    list.map(async (v) => {
                      try {
                        await removeUserFromProject(v.id, v.projectId);
                      } catch (projectError) {
                        console.warn(
                          `Failed to remove user from project ${v.projectId}, but continuing: `,
                          projectError
                        );
                      }
                    })
                  );
                }
              } catch (apiError) {
                // Log Learnifier API error but continue with seat removal
                console.error(
                  "Error with Learnifier API, continuing with seat removal:",
                  apiError
                );
              }
              removeUserFromProjects(learnifierId)
            }
          }
        } catch (LearnifierError) {
          // Log any errors but continue with updating the seat
          console.error(
            "Error during Learnifier operations, continuing with seat removal:",
            LearnifierError
          );
        }
      }

      // Always proceed with updating the seat regardless of Learnifier API success
      const updatedSeat: SeatResponse = await prisma.seat.update({
        where: { id: seatId },
        data: {
          user:
            userId === "" ? { disconnect: true } : { connect: { id: userId } },
        },
        include: {
          user: { include: { teams: { include: { courses: true } } } },
        },
      });

      // If adding a user to a seat, try to add them to their team projects
      if (userId !== "" && updatedSeat.user) {
        const user = updatedSeat.user as IUser;

        if (user && user.teams && user.teams.length > 0) {
          try {
            await Promise.all(
              user.teams.map(async (team) => {
                try {
                  await addUserToProject({ user, team });
                } catch (projectError) {
                  console.warn(
                    `Failed to add user to project for team ${team.id}, but continuing: `,
                    projectError
                  );
                }
              })
            );
          } catch (addError) {
            console.error(
              "Error adding user to projects, but seat assignment succeeded:",
              addError
            );
          }
        }
      }

      res.status(200).json({ data: updatedSeat });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update seat" });
    }
  }
}

export const seatController = new SeatController();
