import { Router } from "express";
import { toggleFollow, searchUsers, getUserStatus } from "../controllers/social.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/follow/:targtetUserId", toggleFollow);    
router.get("/search", searchUsers);
router.get("/status/:userId", getUserStatus);
router.get("/status", getUserStatus);

export default router;