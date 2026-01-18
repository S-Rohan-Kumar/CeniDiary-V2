import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  changePassword,
  GetCurrentUser,
  updateProfile,
  addtoWatchHistory,
  getPublicProfile
} from "../controllers/user.controller.js";
import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyEmail } from "../controllers/verifyEmail.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/register",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  registerUser
);

router.post("/login", upload.none(), loginUser);

router.get("/verify/:token", verifyEmail);
router.post("/refresh-token", upload.none(), refreshAccessToken);
router.post("/logout", verifyJWT, logoutUser);
router.post("/change-password", upload.none(), changePassword);

router.get("/me", verifyJWT, GetCurrentUser);
router.patch("/me/update",verifyJWT, upload.single("avatar"), updateProfile);
router.post("/watch-history", verifyJWT, addtoWatchHistory);
router.get("/u/:username", getPublicProfile);

export default router;
