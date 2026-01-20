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
    descriptoin: description || "", 
    isPublic: isPublic || false,
    owner: req.user._id,
    movies: [],
  });
  console.log(newList);
  return res
    .status(201)
    .json(new APIResponse(201, newList, "List created successfully"));
});

const editList = asyncHandler(async (req, res) => {
  const { listId } = req.params;
  const { title, description, isPublic } = req.body;

  if (!title || !description || typeof isPublic !== "boolean") {
    throw new APIError(400, "All fields are required");
  }

  const list = await List.findById(listId);
  if (!list) throw new APIError(404, "List not found");

  if (list.owner.toString() !== req.user._id.toString()) {
    throw new APIError(403, "Not authorized to edit this list");
  }

  list.title = title;
  list.description = description;
  list.isPublic = isPublic;

  await list.save({ validateBeforeSave: false });

  return res.status(200).json(new APIResponse(200, list, "List updated successfully"));
});

const addMovietoList = asyncHandler(async (req, res) => {
  const { listId, movieId } = req.params;
  const { mediaType } = req.body; // Expecting 'movie' or 'tv' from frontend

  // 1. NaN PROTECTION: Prevent database crash if ID is undefined
  const cleanMovieId = Number(movieId);
  if (isNaN(cleanMovieId)) {
    throw new APIError(400, "Invalid Media ID provided");
  }

  const list = await List.findById(listId);
  if (!list) throw new APIError(404, "List not found");

  // 2. COLLISION PROTECTION: Find by ID AND Type
  const type = mediaType || "movie";
  let movie = await Movie.findOne({ tmdbId: cleanMovieId, mediaType: type });

  if (!movie) {
    try {
      // 3. DYNAMIC SYNC: Fetch correct data from TMDB
      const tmdbUrl = `https://api.themoviedb.org/3/${type}/${cleanMovieId}?api_key=${process.env.TMDB_KEY}`;
      const response = await axios.get(tmdbUrl);
      const data = response.data;

      // 4. NORMALIZATION: Map TV 'name' to 'title'
      movie = await Movie.create({
        tmdbId: data.id,
        mediaType: type,
        title: data.title || data.name,
        posterPath: data.poster_path,
        backdropPath: data.backdrop_path,
        overview: data.overview,
        releaseDate: data.release_date || data.first_air_date,
        genreIds: data.genres?.map((g) => g.id),
        voteAverage: data.vote_average,
      });
    } catch (error) {
      throw new APIError(500, "Failed to sync media from TMDB");
    }
  }

  if (list.owner.toString() !== req.user._id.toString()) {
    throw new APIError(403, "Not authorized");
  }

  // Use $addToSet to prevent duplicate ObjectIDs in the array
  const updatedList = await List.findByIdAndUpdate(
    listId,
    { $addToSet: { movies: movie._id } },
    { new: true }
  ).populate("movies");

  return res.status(200).json(new APIResponse(200, updatedList, "Success"));
});

const removeMovieFromList = asyncHandler(async (req, res) => {
  const { listId, movieId } = req.params;
  const { mediaType } = req.query; // Get type from query params

  const cleanMovieId = Number(movieId);
  if (isNaN(cleanMovieId)) throw new APIError(400, "Invalid ID");

  // 1. Find the movie using the compound criteria
  const movie = await Movie.findOne({ 
    tmdbId: cleanMovieId, 
    mediaType: mediaType || "movie" 
  });

  if (!movie) throw new APIError(404, "Media not found in local database");

  // 2. Remove the specific ObjectID from the list
  const updatedList = await List.findByIdAndUpdate(
    listId,
    { $pull: { movies: movie._id } },
    { new: true }
  ).populate("movies");

  if (!updatedList) throw new APIError(404, "List not found");

  return res.status(200).json(
    new APIResponse(200, updatedList, "Removed from collection successfully")
  );
});

const getUserLists = asyncHandler(async (req, res) => {
  const lists = await List.find({ owner: req.user._id }).populate("movies");
  console.log(lists);
  return res.status(200).json(new APIResponse(200, lists, "Collections fetched"));
});

const removeList = asyncHandler(async (req, res) => {
  const { listId } = req.params;
  const list = await List.findById(listId);
  if (!list) throw new APIError(404, "List not found");
  if (list.owner.toString() !== req.user._id.toString()) throw new APIError(403, "Unauthorized");
  
  await List.findByIdAndDelete(listId);
  return res.status(200).json(new APIResponse(200, {}, "Deleted"));
});

const getListById = asyncHandler(async (req, res) => {
  const { listId } = req.params;

  const list = await List.findById(listId)
    .populate("movies")
    .populate("owner", "username avatar");

  if (!list) {
    throw new APIError(404, "Collection not found");
  }

  return res.status(200).json(
    new APIResponse(200, list, "Collection fetched successfully")
  );
})

export { createList, addMovietoList, getUserLists, removeMovieFromList, editList, removeList, getListById };