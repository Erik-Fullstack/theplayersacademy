import express from "express";
import { organizationController } from "../controllers/organization.controller";
import { invitationController } from "../controllers/invite.controller";
import { seatController } from "../controllers/seat.controller";
import { organizationUserController } from "../controllers/organization.user.controller";
import { checkOrgOwner, checkSuperAdmin } from "../middleware/auth";

const router = express.Router();

// Organization routes
router.post("/", organizationController.create);
router.get("/", checkSuperAdmin,organizationController.getAll);
router.get("/:orgId", checkOrgOwner, organizationController.getById);
router.put("/:orgId", checkOrgOwner, organizationController.update);
router.delete("/:orgId", checkSuperAdmin, organizationController.delete);
//Temporarly removed auth check as there is no frontend feature to delete organizations and we dont have local access to the DB
//router.delete("/:orgId", organizationController.delete);

// User routes
router.get("/:orgId/users", checkOrgOwner, organizationUserController.getAll);

// Invitation routes
router.post("/:orgId/invites", checkOrgOwner, invitationController.create);
router.get("/:orgId/invites", checkOrgOwner, invitationController.getByOrganization);
router.get("/invites/org/:inviteCode", checkOrgOwner, invitationController.getOrgInfoFromInvitation);
router.delete("/:orgId/invites/:inviteId", checkOrgOwner, invitationController.delete);

// Seat routes
router.get("/:orgId/seats", checkOrgOwner, seatController.getByOrganization);
router.get("/:orgId/seats/:seatId", checkOrgOwner, seatController.getById);
router.put("/:orgId/seats/:seatId", checkOrgOwner, seatController.update);

export default router;
