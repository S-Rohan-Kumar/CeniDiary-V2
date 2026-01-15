import { Router } from "express";
import { addReview, getMovieReviews } from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/add").post(verifyJWT, addReview);
router.route("/m/:movieId").get(getMovieReviews); 

export default router;