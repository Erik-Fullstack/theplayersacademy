import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { addUserToProject, participationList, removeUserFromProject } from "../utils/projectUtils";
import { getUniqueLearnifierIdsByGenderYear, getUserCourses } from "../utils/getUserCourses";

// Functions:
// GET TEAM COACHES
// ADD COACH TO TEAM
// REMOVE COACH FROM TEAM

export class TeamCoachesController {
  // *
  // * GET TEAM COACHES
  // *
  async getCoaches(req: Request, res: Response) {
    const { teamId } = req.params;

    try {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
          coaches: true
        }
      });

      if (!team) {
        res.status(404).json({ error: "Team not found" });
        return;
      }

      res.status(200).json({ 
        data: team.coaches,
        meta: { total: team.coaches.length }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve team coaches" });
    }
  }

  // *
  // * ADD COACH TO TEAM
  // *
  async addCoach(req: Request, res: Response) {
    const { teamId, userId } = req.params;

    try {
      const updatedTeam = await prisma.team.update({
        where: { id: teamId },
        data: {
          coaches: {
            connect: { id: userId }
          }
        },
        include: { coaches: {include:{teams:true}}, courses:true}
      });
    
      const updatedUser = updatedTeam.coaches.filter(coach => coach.id === userId)[0]

      addUserToProject({user:updatedUser, team:updatedTeam})

      res.status(200).json({
        data: updatedTeam,
        message: "Coach added to team"
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add coach to team" });
    }
  }

  // *
  // * REMOVE COACH FROM TEAM
  // *
  async removeCoach(req: Request, res: Response) {
    const { teamId, userId } = req.params;

    try {

      const userData = await getUserCourses(userId);

      const updatedTeam = await prisma.team.update({
        where: { id: teamId },
        data: {
          coaches: {
            disconnect: { id: userId }
          }
        },
        include: { coaches: true, courses:true }
      });

      const learnifierIdsToRemove = getUniqueLearnifierIdsByGenderYear(userData!.teams, updatedTeam.gender, updatedTeam.year)
      const plist = await participationList(userData?.learnifierId);
      plist?.forEach(project => {
        if(learnifierIdsToRemove.includes(project.projectId.toString())) {
          removeUserFromProject(project.id, project.projectId)}
      })

      res.status(200).json({
        data: updatedTeam,
        message: "Coach removed from team"
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Faield to remove coach from team" });
    }
  }
}

export const teamCoachesController = new TeamCoachesController();
