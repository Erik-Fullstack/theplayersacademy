import express from "express";
import { teamController } from "../controllers/team.controller";
import { teamCoachesController } from "../controllers/team.coaches.controller";

const router = express.Router();

// Team routes
router.post("/", teamController.create);
router.get("/", teamController.getAll);
router.get("/:id", teamController.getById);
router.put("/:id", teamController.update);
router.delete("/:id", teamController.delete);

// Organization-specific team routes
router.get("/organization/:orgId", teamController.getByOrganization);

// Course-specific team routes
router.get("/:id/courses", teamController.getTeamCourses);

// Coach management routes
router.get("/:teamId/coaches", teamCoachesController.getCoaches);
router.put("/:teamId/coaches/:userId", teamCoachesController.addCoach);
router.delete("/:teamId/coaches/:userId", teamCoachesController.removeCoach);

export default router;
