import { Router } from 'express';
import { searchMovies, getandSyncMovie, getTrendingMovies } from "../controllers/movie.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get('/search', verifyJWT, searchMovies);
router.post('/trending', verifyJWT, getTrendingMovies);
router.get('/sync/:tmdbId', verifyJWT, getandSyncMovie);

export default router;