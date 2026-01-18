import { Router } from "express";
import { addReview, getMovieReviews , getMovieStats, getUserReviews } from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/add").post(verifyJWT, addReview);
router.route("/stats/:movieId").get(getMovieStats);
router.route("/m/:movieId").get(getMovieReviews); 
router.route("/user/:userId").get(getUserReviews);


export default router;