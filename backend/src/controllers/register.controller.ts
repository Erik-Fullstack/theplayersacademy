import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { SerializeUser } from "../types/models";


export class RegisterController {
  register = async (req: Request, res: Response) => {
    const { association, seats} = req.body;
    const { firstName, lastName, email, id } = req.user as SerializeUser;

    if (!firstName || !lastName || !email || !association || !seats) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    try {
      const result = await prisma.$transaction(async (tx) => {


        //Skapa organization
        const organization = await tx.organization.create({
          data: {
            name: association,
            ownerId: id,
          },
        });

        //Koppla user till organization
        await tx.user.update({
          where: { id: id },
          data: {
            organizationId: organization.id,
          },
        });
        // Skapa Subscription // Enbart för testmiljö

        //Skapa orgprofile
        await tx.orgProfile.create({
          data: {
            // phone: parseInt(phone),
            logo: "",
            colors: "",
            introText: "Välkommen till vår förening",
            organizationId: organization.id,
          },
        });

        //Skapa seats
        const createdSeats = await Promise.all(
          Array.from({ length: parseInt(seats) }).map(() =>
            tx.seat.create({
              data: {
                organizationId: organization.id,
              },
            })
          )
        );

        return { organization, seats: createdSeats.length };
      });

      res.status(201).json({
        message: "Registration successful",
        data: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Registration failed" });
    }
  };
}

export const registerController = new RegisterController();
