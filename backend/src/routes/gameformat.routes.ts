import { Router } from "express";
import { gameFormatController } from "../controllers/gameformat.controller";

const router = Router();

// GameFormat routes
router.get("/", gameFormatController.getAll);
router.get("/:formatId", gameFormatController.getById);

export default router;
