import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { updateData } from "../utils/updateHelper";
import { removeUserFromProjects } from "../utils/projectUtils";

// Functions:
// GET ALL
// GET BY ORGANIZATION ID
// UPDATE
// UPDATE SEAT LIMIT
// ACTIVATE
// DEACTIVATE

export class SubscriptionController {
  // *
  // * GET ALL
  // *
  async getAll(req: Request, res: Response) {
    try {
      const subscriptions = await prisma.subscription.findMany({
        include: { organization: true },
      });

      res.status(200).json({
        data: subscriptions,
        meta: { total: subscriptions.length },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve subscriptions" });
    }
  }

  // *
  // * GET BY ORGANIZATION ID
  // *
  async getByOrganizationId(req: Request, res: Response) {
    const { orgId } = req.params;

    try {
      const subscription = await prisma.subscription.findUnique({
        where: { organizationId: orgId },
        include: { organization: true },
      });

      if (!subscription) {
        res.status(404).json({ error: "Subscription not found" });
        return;
      }

      res.status(200).json({ data: subscription });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Failed to retrieve organization subscription" });
    }
  }

  // *
  // * UPDATE
  // *
  async update(req: Request, res: Response) {
    const { paymentInfo, seatLimit, pricePlan } = req.body;
    const { orgId } = req.params;

    try {
      const subscription = await prisma.subscription.findUnique({
        where: { organizationId: orgId },
        select: { id: true, seatLimit: true },
      });

      if (!subscription) {
        res.status(404).json({ error: "Subscription not found" });
        return;
      }

      const updatePayload = {
        ...(paymentInfo !== undefined && { paymentInfo }),
        ...(pricePlan !== undefined && { pricePlan }),
        // Don't include seatLimit here as we'll handle it separately
      };

      if (Object.keys(updatePayload).length === 0 && seatLimit === undefined) {
        res.status(400).json({ error: "No fields provided for update" });
        return;
      }

      // First, update the subscription with non-seatLimit fields
      let updatedSubscription;
      if (Object.keys(updatePayload).length > 0) {
        updatedSubscription = await updateData(
          subscription.id,
          updatePayload,
          "subscription"
        );
      }

      // Now handle seat limit changes if provided
      if (seatLimit !== undefined) {
        // Update the seat limit
        updatedSubscription = await prisma.subscription.update({
          where: { organizationId: orgId },
          data: { seatLimit },
        });

        // Get all seats for the organization
        const allSeats = await prisma.seat.findMany({
          where: { organizationId: orgId },
          orderBy: {
            // Order by userId to prioritize keeping seats with users
            userId: "desc",
          },
        });

        const currentSeatCount = allSeats.length;

        // Handle seat count changes
        if (seatLimit < currentSeatCount) {
          // Find seats without users first (userId is null)
          const unusedSeats = allSeats.filter((seat) => seat.userId === null);
          const usedSeats = allSeats.filter((seat) => seat.userId !== null);

          if (usedSeats.length > seatLimit) {
            // Too many seats with users - this is a problem
            res.status(400).json({
              error: `Cannot reduce seats below number of seats in use (${usedSeats.length})`,
            });
            return;
          }

          // Calculate how many unused seats to delete
          const seatsToRemoveCount = currentSeatCount - seatLimit;
          const seatsToRemove = unusedSeats.slice(0, seatsToRemoveCount);
          const seatIdsToDelete = seatsToRemove.map((seat) => seat.id);

          // Delete the unused seats
          await prisma.seat.deleteMany({
            where: { id: { in: seatIdsToDelete } },
          });
        } else if (seatLimit > currentSeatCount) {
          // Add new seats
          const newSeatsCount = seatLimit - currentSeatCount;
          const newSeats = Array.from({ length: newSeatsCount }, () => ({
            organizationId: orgId,
          }));

          await prisma.seat.createMany({
            data: newSeats,
          });
        }
      }

      // Get the freshly updated subscription with all latest data
      const finalSubscription = await prisma.subscription.findUnique({
        where: { organizationId: orgId },
        include: { organization: true },
      });

      // Get seat statistics
      const [totalSeats, usedSeats] = await Promise.all([
        prisma.seat.count({ where: { organizationId: orgId } }),
        prisma.seat.count({
          where: { organizationId: orgId, userId: { not: null } },
        }),
      ]);

      // Return the updated subscription with seat stats
      res.status(200).json({
        data: {
          ...finalSubscription,
          seatStats: {
            total: totalSeats,
            used: usedSeats,
            available: totalSeats - usedSeats,
          },
        },
        message: "Subscription updated successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update subscription" });
    }
  }

  // *
  // * ACTIVATE
  // *
  async activate(req: Request, res: Response) {
    const { orgId } = req.params;
    const { seatLimit } = req.body;

    try {
      // Find the subscription for the organization
      const subscription = await prisma.subscription.findUnique({
        where: { organizationId: orgId },
      });

      if (!subscription) {
        res.status(404).json({ error: "Subscription not found" });
        return;
      }

      // Update status and seat limit
      const updatedSubscription = await prisma.subscription.update({
        where: { organizationId: orgId },
        data: {
          status: "ACTIVE",
          seatLimit,
        },
      });

      // Create seats based on seat limit
      const seats = Array.from(
        { length: updatedSubscription.seatLimit },
        () => ({
          organizationId: orgId,
        })
      );

      await prisma.seat.createMany({
        data: seats,
      });

      res.status(200).json({
        data: updatedSubscription,
        message: "Subscription activated and seats created",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to activate subscription" });
    }
  }

  // *
  // * DEACTIVATE
  // *
  async deactivate(req: Request, res: Response) {
    const { orgId } = req.params;

    try {
      // Find the subscription for the organization
      const subscription = await prisma.subscription.findUnique({
        where: { organizationId: orgId },
      });

      if (!subscription) {
        res.status(404).json({ error: "Subscription not found" });
        return;
      }

      // Delete all seats for the organization
      await prisma.seat.deleteMany({
        where: { organizationId: orgId },
      });

      // Update status to INACTIVE
      const updatedSubscription = await prisma.subscription.update({
        where: { organizationId: orgId },
        data: {
          status: "INACTIVE",
        },
      });

      res.status(200).json({
        data: updatedSubscription,
        message: "Subscription deactivated and all seats removed",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to deactivate subscription" });
    }
  }
}

export const subscriptionController = new SubscriptionController();
