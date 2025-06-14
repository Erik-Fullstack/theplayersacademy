import { Router } from "express";
import { learnifyController } from "../controllers/learnifier.controller";
const router = Router();


router.post('/user', learnifyController.createUser)
router.get('/user', learnifyController.getUser)
router.get('/user/:externalId', learnifyController.getUserByExtId)
router.get('/learnuser/:learnifierId', learnifyController.getUserByLearnifierId)
router.get('/user/awards', learnifyController.getAwards)
router.get('/userawards/:externalId', learnifyController.getAwardsByExtId)

router.get('/projects', learnifyController.projectList)
router.get('/awards', learnifyController.getAwards)


export default router