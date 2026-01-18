import { Router } from "express";
import {
  createList,
  addMovietoList,
  getUserLists,
  removeMovieFromList,
  editList,
  removeList,
} from "../controllers/list.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.post("/create", createList);
router.put("/edit/:listId", editList);
router.delete("/remove/:listId", removeList);
router.post("/add/:listId/:movieId", addMovietoList);
router.get("/", getUserLists);
router.delete("/remove/:listId/:movieId", removeMovieFromList);

export default router;
