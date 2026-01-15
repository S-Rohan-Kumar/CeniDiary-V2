import { registerUser, loginUser } from "../controllers/user.controller.js";
import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyEmail } from "../controllers/verifyEmail.js"

const router = Router();

router.post(
  "/register",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  registerUser
);

router.post("/login", upload.none(), loginUser);

router.get("/verify/:token", verifyEmail);

export default router;
