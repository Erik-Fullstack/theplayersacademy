import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { generateUsersForOrg, IOrganization } from "../utils/demoUtils";
import { SerializeUser } from "../types/models";
import { Course, GameFormat, Prisma } from "@prisma/client";
import { loadFromJson } from "../utils/loadFileData";
import { generateWelcomeMessage } from "../utils/welcomeMessages";

//Endpoints purely meant to be used for generating data for demos

class DemoController {
  async createOrganization(req: Request, res: Response) {
    const { association, seats } = req.body;
    const { id } = req.user as SerializeUser;

    if(!id) {
      res.status(404).json({error:"User id not found"})
    }

    try {
      if (!association) {
        res.status(400).json({ error: "Invalid arguments used" });
        return;
      }

      const welcomeMessage = generateWelcomeMessage(association);

      const org = await prisma.organization.create({
        data: {
          name: association,
          owner: { connect: { id: id } },
          profile: {
            create: {
              logo: "",
              colors: "",
              introText: welcomeMessage,
            },
          },
          subscription: {
            create: {
              paymentInfo: "",
              seatLimit: seats,
            },
          },
        },
        include: {
          owner: true,
          profile: true,
          subscription: { select: { seatLimit: true } },
        },
      });

      const user = await prisma.user.update({
        where: { id: id },
        data: {
          organizationId: org.id,
          role: "ADMIN",
        },
      });

      await generateUsersForOrg(org as IOrganization, user);
      res.status(201).json({ data: org });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          res
            .status(409)
            .json({ error: "Organization with that name already exists" });
        } else {
          res.status(500).json({ error: "Failed to create organization" });
          console.error(error);
        }
      }
    }
  }

  //Meant to inject data into the DB as we don't have access to the DB environment 
  async createCourseData(req: Request, res: Response) {
    const DATA_LOCATION = "prisma/seed_data";
  
    const gameFormats = loadFromJson<Prisma.GameFormatCreateInput[]>(
      "gameFormats.json",
      DATA_LOCATION
    );
  
    const responseData: { newFormats: GameFormat[] } = { newFormats: [] };
  
    for (const format of gameFormats) {
      const exists = await prisma.gameFormat.findFirst({ where: { name: format.name } });
      if (!exists) {
        const newFormat = await prisma.gameFormat.create({ data: format });
        responseData.newFormats.push(newFormat);
      }
    }
  
    const courses = loadFromJson<Prisma.CourseCreateInput[]>(
      "courses.json",
      DATA_LOCATION
    );
  
    const savedCourses: Course[] = [];
  
    for (const course of courses) {
      const exists = await prisma.course.findFirst({ where: { name: course.name } });
      if (!exists) {
        const formatName =
          typeof course.format === "string"
            ? course.format
            : (course.format as any)?.name;
  
        const format = await prisma.gameFormat.findFirst({ where: { name: formatName } });
  
        const newCourse = await prisma.course.create({
          data: {
            name: course.name,
            description: course.description,
            learnifierId: course.learnifierId || "default-id",
            ...(format ? { gameFormatId: format.id } : {}),
          },
        });
  
        savedCourses.push(newCourse);
      }
    }
  
     res.status(200).json({
      message: {
        formats: responseData,
        courses: savedCourses,
      },
    });
  }
}

export const demoController = new DemoController();
