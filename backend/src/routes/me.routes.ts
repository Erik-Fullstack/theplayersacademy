import express from "express";
import { getMe, updateMe } from "../controllers/me.controller";
import { authCheck } from "../middleware/auth";

const router = express.Router();

router.get("/", authCheck, getMe);
router.put("/", authCheck, updateMe);

export default router;
