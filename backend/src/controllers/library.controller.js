import { APIResponse } from "../utils/api-response.js";
import { APIError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.model.js";
import { Movie } from "../models/movie.model.js";
import axios from "axios";

const toggleWatchlistItem = asyncHandler(async (req, res) => {
  const { movieId } = req.params;

  let movie = await Movie.findOne({ tmdbId: movieId });

  if (!movie) {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_KEY}`
      );

      const data = response.data;

      movie = await Movie.create({
        tmdbId: data.id,
        title: data.title,
        posterPath: data.poster_path,
        backdropPath: data.backdrop_path,
        overview: data.overview,
        releaseDate: data.release_date,
        genreIds: data.genres.map((genre) => genre.id),
        voteAverage: data.vote_average,
      });
    } catch (error) {
      throw new APIError(500, "Failed to fetch movie from external API");
    }
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    throw new APIError(404, "User not found");
  }
  console.log(movieId);
  console.log(user);

  const isAdded = user.watchlist.some(id => id.toString() === movie._id.toString());

  if (isAdded) {
    user.watchlist.pull(movie._id);
  } else {
    user.watchlist.push(movie._id);
  }

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        user.watchlist,
        isAdded ? "Removed from watchlist" : "Added to watchlist"
      )
    );
});

const toggleFavoritesItem = asyncHandler(async (req, res) => {
  const { movieId } = req.params;

  let movie = await Movie.findOne({ tmdbId: movieId });

  if (!movie) {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_KEY}`
      );

      const data = response.data;

      movie = await Movie.create({
        tmdbId: data.id,
        title: data.title,
        posterPath: data.poster_path,
        backdropPath: data.backdrop_path,
        overview: data.overview,
        releaseDate: data.release_date,
        genreIds: data.genres.map((genre) => genre.id),
        voteAverage: data.vote_average,
      });
    } catch (error) {
      console.log(error);
      throw new APIError(500, "Failed to fetch movie from external API");
    }
  }
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new APIError(404, "User not found");
  }

  const isFav = user.favorites.some(id => id.toString() === movie._id.toString());

  if (isFav) {
    user.favorites.pull(movie._id);
  } else {
    user.favorites.push(movie._id);
  }

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        user.favorites,
        isFav ? "Removed from favorites" : "Added to favorites"
      )
    );
});

const getallWatchlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new APIError(404, "User not found");
  }
  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        user.watchlist,
        "User watchlist fetched successfully"
      )
    );
});

const getallFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new APIError(404, "User not found");
  }
  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        user.favorites,
        "User favorites fetched successfully"
      )
    );
})

export { toggleWatchlistItem, toggleFavoritesItem, getallWatchlist, getallFavorites };