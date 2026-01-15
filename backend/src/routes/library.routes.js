import { Router } from 'express';
import { toggleWatchlistItem, toggleFavoritesItem, getallWatchlist, getallFavorites } from "../controllers/library.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/watchlist/:movieId", verifyJWT, toggleWatchlistItem);
router.post("/favorites/:movieId", verifyJWT, toggleFavoritesItem);
router.get("/watchlist", verifyJWT, getallWatchlist);
router.get("/favorites", verifyJWT, getallFavorites);

export default router;