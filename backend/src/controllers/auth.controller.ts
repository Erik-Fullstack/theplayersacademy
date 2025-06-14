/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { SerializeUser } from "../types/models";
import { FRONTEND_BASE_URL } from "../config/api";

export class AuthController {
  // 
  // * Gets user info
  //  GET /auth/current/log
  async getAuth(req: Request, res: Response) {
    const cookie = req.user as SerializeUser;
    if(!cookie) return
    try {
      const user = await prisma.user.findFirst({
        where: { id: cookie.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          organization: {
            include: {
              subscription: true,
              profile: true,
            },
          },
          seat: true,
          assignedCourses: true,
          teams: true,
          ownedOrganization: true,
        },
      });
      res.status(200).json({data: user})
    } catch (error) {
    res.status(500).json({error: `${error}`})
    }
  };
  // 
  //  * Destroys the session associated with cookie sent
  //  GET /auth/logout
  async logout(req: Request, res: Response, next: NextFunction) {
    res.clearCookie('academy')
    req.session = null;
    req.user = undefined;
    res.status(200).json({ data: 'user cleared'})
  };
  //
  //  * Callback after succesfull google login
  // 
  async oauthCallback (req: Request, res: Response, next: NextFunction) {
    if (!req.user) res.status(500).json({ message: "No session found" });
    const user: SerializeUser = req.user ? req.user : {};
    res.redirect(`${FRONTEND_BASE_URL}/dashboard`);
    res.status(200);
  };
}

export const authController = new AuthController();
