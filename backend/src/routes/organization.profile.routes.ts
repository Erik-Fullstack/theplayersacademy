import express from "express";
import { orgProfileController } from "../controllers/organization.profile.controller";
import { upload } from "../services/fileUpload/middlewares";
import { checkOrgOwner } from "../middleware/auth";
// import { orgImageController } from "../controllers/orgimage.controller";

const router = express.Router();

router.get("/:orgId", checkOrgOwner, orgProfileController.getByOrganizationId);
router.put("/:orgId", checkOrgOwner ,upload.logo.single("logo"), orgProfileController.update)
//router.post("/upload/:orgId", upload.logo.single("logo"), orgImageController.upload);

export default router;
