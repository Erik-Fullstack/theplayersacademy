import express from "express";
import { priceController } from "../controllers/price.controller";

const router = express.Router();

router.post("/", priceController.createPlan);
router.get("/", priceController.getPlans);
router.get("/config", priceController.getConfig);
router.get("/:plan/:slots?", priceController.getPlanPrice);
router.put("/:plan", priceController.updatePlanPrice);
router.delete("/:plan", priceController.deletePlan);

export default router;