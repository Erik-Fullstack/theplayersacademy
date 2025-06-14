import { Router } from "express";
import { courseController } from "../controllers/course.controller";
import { checkSuperAdmin, checkOrgOwner } from "../middleware/auth";

const router = Router();

// Course routes
router.post("/", checkSuperAdmin, courseController.create);
router.get("/", courseController.getAll);
router.get("/:courseId", checkSuperAdmin, courseController.getById);
router.put("/:courseId", checkSuperAdmin, courseController.update);
router.delete("/:courseId", checkSuperAdmin, courseController.delete);

// Stats route
router.get("/stats/:orgId", checkOrgOwner, courseController.getCourseStats);

// User assignment routes
router.get("/:courseId/users", courseController.getAssignedUsers);
router.post("/:courseId/users", courseController.assignUser);
router.delete("/:courseId/users/:userId", courseController.removeUser);


export default router;
