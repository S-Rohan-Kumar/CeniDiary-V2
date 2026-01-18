import { APIResponse } from "../utils/api-response.js";
import { APIError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { List } from "../models/list.model.js";
import { Movie } from "../models/movie.model.js";
import axios from "axios";

const createList = asyncHandler(async (req, res) => {
  const { title, description, isPublic } = req.body;

  if (!title) {
    throw new APIError(400, "List name is required");
  }

  const newList = await List.create({
    title,
    description,
    isPublic: isPublic || false,
    owner: req.user._id,
    movies: [],
  });

  return res
    .status(201)
    .json(new APIResponse(201, "List created successfully", newList));
});

const editList = asyncHandler(async (req, res) => {
  const { listId } = req.params;
  const { title, description, isPublic } = req.body;

  if (!title || !description || typeof isPublic !== "boolean") {
    throw new APIError(400, "All fields are required");
  }

  const list = await List.findById(listId);
  if (!list) {
    throw new APIError(404, "List not found");
  }

  if (list.owner.toString() !== req.user._id.toString()) {
    throw new APIError(403, "Not authorized to edit this list");
  }

  list.title = title;
  list.description = description;
  list.isPublic = isPublic;

  await list.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new APIResponse(200, list, "List updated successfully"));
});

const addMovietoList = asyncHandler(async (req, res) => {
  const { listId, movieId } = req.params;

  const cleanMovieId = movieId.trim();

  console.log(`--- DEBUG: Adding Movie ${cleanMovieId} to List ${listId} ---`);

  const list = await List.findById(listId);
  if (!list) throw new APIError(404, "List not found");

  let movie = await Movie.findOne({ tmdbId: Number(cleanMovieId) });

  if (!movie) {
    console.log("Movie not in DB. Attempting to sync with TMDB...");
    try {
      const tmdbUrl = `https://api.themoviedb.org/3/movie/${cleanMovieId}?api_key=${process.env.TMDB_KEY}`;
      console.log("Requesting URL:", tmdbUrl);

      const response = await axios.get(tmdbUrl);
      const data = response.data;

      movie = await Movie.create({
        tmdbId: data.id,
        title: data.title,
        posterPath: data.poster_path,
        backdropPath: data.backdrop_path,
        overview: data.overview,
        releaseDate: data.release_date,
        genreIds: data.genres.map((g) => g.id),
        voteAverage: data.vote_average,
      });
      console.log("Successfully synced and created:", movie.title);
    } catch (error) {
      console.error("TMDB REJECTION:", error.response?.data || error.message);
      throw new APIError(
        error.response?.status || 500,
        "TMDB rejected this ID. Check logs.",
      );
    }
  }

  if (list.owner.toString() !== req.user._id.toString()) {
    throw new APIError(403, "Not authorized");
  }

  const updatedList = await List.findByIdAndUpdate(
    listId,
    { $addToSet: { movies: movie._id } },
    { new: true },
  ).populate("movies");

  return res.status(200).json(new APIResponse(200, updatedList, "Success"));
});

const getUserLists = asyncHandler(async (req, res) => {
  const lists = await List.find({ owner: req.user._id }).populate("movies");
  if (!lists) {
    throw new APIError(404, "No lists found");
  }
  return res
    .status(200)
    .json(new APIResponse(200, lists, "User collections fetched successfully"));
});

const removeList = asyncHandler(async (req, res) => {
  const { listId } = req.params;

  const list = await List.findById(listId);
  if (!list) {
    throw new APIError(404, "List not found");
  }
  if (list.owner.toString() !== req.user._id.toString()) {
    throw new APIError(403, "You are not authorized to delete this list");
  }
  const updtaedList = await List.findByIdAndDelete(listId);

  return res
    .status(200)
    .json(new APIResponse(200, updtaedList, "List deleted successfully"));
});

const removeMovieFromList = asyncHandler(async (req, res) => {
  const { listId, movieId } = req.params;

  const list = await List.findById(listId);
  const movie = await Movie.findOne({ tmdbId: Number(movieId) });

  if (!movie) {
    throw new APIError(404, "Movie not found");
  }
  if (!list) {
    throw new APIError(404, "List not found");
  }
  if (list.owner.toString() !== req.user._id.toString()) {
    throw new APIError(403, "You are not authorized to modify this list");
  }

  const updatedList = await List.findByIdAndUpdate(
    listId,
    {
      $pull: { movies: movie._id },
    },
    { new: true },
  ).populate("movies");

  return res
    .status(200)
    .json(
      new APIResponse(200, updatedList, "Movie removed from list successfully"),
    );
});

export {
  createList,
  addMovietoList,
  getUserLists,
  removeMovieFromList,
  editList,
  removeList,
};
