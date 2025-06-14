import { Router } from "express";
import { testController } from "../controllers/test.controller";
const router = Router();

router.get("/user", testController.getUser);
router.get("/admin", testController.getAdmin);
router.get("/superadmin", testController.getSuperAdmin);
router.get("/role/:role", testController.getByRole);

export default router;
