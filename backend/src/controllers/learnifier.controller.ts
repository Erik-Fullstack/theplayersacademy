import { Request, Response } from "express";
import { SerializeUser } from "../types/models";

const username = process.env.LEARNIFIER_PUBLIC_KEY;
const password = process.env.LEARNIFIER_SECRET_KEY;
const auth = btoa(`${username}:${password}`);
const endpointURL = process.env.LEARNIFIER;
const ORGANIZATION_ID = process.env.ORGANIZATION_ID

interface projectResponse {
  name: string;
  uuid: string;
  userDescription: string;
  id: string;
}

export class LearnifyController {
  // GET /learnifier/projects

  async projectList(req: Request, res: Response) {
    try {
      const request = await fetch(`${endpointURL}/orgunits/${ORGANIZATION_ID}/projects/`, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Basic ${auth}`,
        },
      });

      const response = await request.json();
      if (!response) res.status(500);
      res.status(200).json({
        data: response.map((project: projectResponse) => {
          return {
            description: project.userDescription,
            name: project.name,
            id: project.uuid,
            learnifierId: project.id,
          };
        }),
      });
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // POST /learnifier/user

  async createUser(req: Request, res: Response) {
    const user: SerializeUser = req.body;
    try {
      const request = await fetch(`${endpointURL}/users`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          externalId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          primaryEmail: user.email,
        }),
      });
      const response = await request.json();
      if (!response) res.status(500);
      res.status(201).json({ data: response });
    } catch (error) {
      console.error("Error:", error);
    }
  }


  // GET /learnifier/user

  async getUser(req: Request, res: Response) {
    const user = req.user as SerializeUser;
    try {
      const request = await fetch(`${endpointURL}/extuser?extid=${user.id}`, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Basic ${auth}`,
        },
      });
      const response = await request.json();
      res.status(201).json({ data: response });
    } catch (error) {
      console.error("Error:", error);
    }
  }
  // GET /learnifier/user/:externalId
  async getUserByExtId(req: Request, res: Response) {
    const { externalId } = req.params;
    try {
      const request = await fetch(
        `${endpointURL}/extuser?extid=${externalId}`,
        {
          method: "GET",
          headers: {
            "Content-type": "application/json",
            Authorization: `Basic ${auth}`,
          },
        }
      );
      const response = await request.json();
      res.status(201).json({ data: response });
    } catch (error) {
      res.status(404).json({ error: error });
      console.error("Error:", error);
    }
  }

    // GET /learnifier/learnUser/:externalId
    async getUserByLearnifierId(req: Request, res: Response) {
        const { learnifierId } = req.params;
        try {
          const request = await fetch(
            `${endpointURL}/users/${learnifierId}`,
            {
              method: "GET",
              headers: {
                "Content-type": "application/json",
                Authorization: `Basic ${auth}`,
              },
            }
          );
          const response = await request.json();
          res.status(201).json({ data: response });
        } catch (error) {
          res.status(404).json({ error: error });
          console.error("Error:", error);
        }
      }

  // GET /learnifier/awards

  async getAwards(req: Request, res: Response) {
    try {
      const request = await fetch(`${endpointURL}/awards`, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Basic ${auth}`,
        },
      });
      const response = await request.json();
      if (!response) res.status(500);
      res.status(200).json({ data: response });
    } catch (error) {
      console.error("Errro:", error);
    }
  }

  // GET /learnifier/user/awards/:externalId

  async getAwardsByExtId(req: Request, res: Response) {
    const { externalId } = req.params;
    try {
      const request = await fetch(`${endpointURL}/userawards?userId=${externalId}`, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Basic ${auth}`,
        },
      });
      const response = await request.json();
      if (!response) res.status(500);
      res.status(200).json({ data: response });
    } catch (error) {
      console.error("Errro:", error);
    }
  }
}

export const learnifyController = new LearnifyController();
