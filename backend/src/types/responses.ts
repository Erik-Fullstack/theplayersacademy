import { Prisma } from "@prisma/client";
import { IUser } from "./models";

export interface SeatResponse {
    id: string | null;
    organizationId: string | null;
    userId: string | null;
    user: IUser | null;
}

export interface participationResponse {
    projectName: string;
    id: number;
    accessLink: string;
    projectId: number;
    firstAccess: string | null;
    firstCompleted: string | null;
}


export type UserWithIncludes = Prisma.UserGetPayload<{
    include: {
      organization: {
        include: {
          subscription: true;
          profile: true;
        };
      };
      teams: {
        include: {
          courses: true;
        };
      };
      assignedCourses: true;
      seat: true;
    };
  }>;
  