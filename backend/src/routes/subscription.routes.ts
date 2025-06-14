import express from "express";
import { subscriptionController } from "../controllers/subscription.controller";
import { checkOrgOwner } from "../middleware/auth";

const router = express.Router();

// Core subscription routes
router.get("/", subscriptionController.getAll);
router.get("/organization/:orgId", checkOrgOwner, subscriptionController.getByOrganizationId);
router.put("/organization/:orgId", checkOrgOwner, subscriptionController.update);

// Status management routes
router.post("/organization/:orgId/activate", checkOrgOwner, subscriptionController.activate);
router.post("/organization/:orgId/deactivate", checkOrgOwner, subscriptionController.deactivate);

export default router;
