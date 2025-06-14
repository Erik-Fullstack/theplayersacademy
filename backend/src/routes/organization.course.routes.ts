import express from "express";
import { organizationCourseController } from "../controllers/organization.course.controller";

const router = express.Router();

// OrgCourse routes
router.post("/", organizationCourseController.create);
router.get("/", organizationCourseController.getAll);
router.get("/:id", organizationCourseController.getById);
router.put("/:id", organizationCourseController.update);
router.delete("/:id", organizationCourseController.delete);

// Organization-specific routes
router.get("/organization/:orgId", organizationCourseController.getByOrganization);

export default router;
