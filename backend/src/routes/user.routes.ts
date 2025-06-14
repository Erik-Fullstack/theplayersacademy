import { Router } from "express";
import { userController } from "../controllers/user.controller";

const router = Router();

// User routes
router.post("/", userController.create);
router.get("/", userController.getAll);
router.get("/:userId", userController.getById);
router.get("/course/:courseId", userController.getByCourse);
router.put("/", userController.update);
router.delete("/:userId", userController.delete);

// Invite routes
router.put("/invite/:inviteCode", userController.updateWithInviteCode);

export default router;
