import { Router } from "express";
import { demoController } from "../controllers/demo.controller";


const router = Router();



router.post("/", demoController.createOrganization);
//router.post("/coursedata", demoController.createCourseData)


export default router;