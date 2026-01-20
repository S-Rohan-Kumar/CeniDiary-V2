import { Router } from "express";
import {
  createList,
  addMovietoList,
  getUserLists,
  removeMovieFromList,
  editList,
  removeList,
  getListById
} from "../controllers/list.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/remove/:listId/:movieId").delete(removeMovieFromList);
router.route("/add/:listId/:movieId").post(addMovietoList);

router.post("/create", createList);
router.put("/edit/:listId", editList);
router.delete("/remove/:listId", removeList); 
router.route("/l/:listId").get(getListById);

router.get("/", getUserLists);

export default router;