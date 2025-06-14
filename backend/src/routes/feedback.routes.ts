import {Router } from "express";
import { feedbackController } from "../controllers/feedback.controller";
import { checkSuperAdmin } from "../middleware/auth";

const router = Router();

// Feedback routes
router.post("/", feedbackController.create);
router.get("/", checkSuperAdmin, feedbackController.getAll);
router.get("/:feedbackId", checkSuperAdmin, feedbackController.getById);
router.put("/:feedbackId", checkSuperAdmin, feedbackController.resolve);
router.delete("/:feedbackId", checkSuperAdmin, feedbackController.delete);

export default router;
