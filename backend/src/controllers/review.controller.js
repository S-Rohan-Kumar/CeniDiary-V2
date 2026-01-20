import { APIResponse } from "../utils/api-response.js";
import { APIError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Review } from "../models/review.model.js";
import { Movie } from "../models/movie.model.js";
import { User } from "../models/user.model.js";
import axios from "axios";

const addReview = asyncHandler(async (req, res) => {
  // 1. Receive mediaType from frontend
  const { comment, sentiment, movieId, mediaType } = req.body; 

  // 2. Find using both ID and Type to avoid collisions
  let movie = await Movie.findOne({ tmdbId: movieId, mediaType: mediaType || "movie" });
  
  if (!movie) {
    throw new APIError(404, "Media not found in local vault. Sync it first.");
  }

  if (!comment || !sentiment || !movieId) {
    throw new APIError(400, "Comment, Sentiment and MovieId are required");
  }

  const review = await Review.create({
    comment,
    sentiment,
    owner: req.user._id,
    movie: movie._id,
  });

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { watchHistory: movie._id },
    $pull: { watchlist: movie._id },
    $inc: { watchNumber: 1 },
  });

  return res.status(201).json(new APIResponse(201, review, "Entry added to Diary"));
});

const getMovieReviews = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const { mediaType } = req.query; // Expecting ?mediaType=tv or ?mediaType=movie

  // Find by both criteria
  let movie = await Movie.findOne({ tmdbId: movieId, mediaType: mediaType || "movie" });

  if (!movie) {
    try {
      const type = mediaType || "movie";
      // 3. DYNAMIC URL: No more hardcoded '/movie/'
      const response = await axios.get(
        `https://api.themoviedb.org/3/${type}/${movieId}?api_key=${process.env.TMDB_KEY}`
      );

      const data = response.data;

      // 4. NORMALIZATION: Treat series 'name' as 'title'
      movie = await Movie.create({
        tmdbId: data.id,
        mediaType: type,
        title: data.title || data.name, 
        posterPath: data.poster_path,
        backdropPath: data.backdrop_path,
        overview: data.overview,
        releaseDate: data.release_date || data.first_air_date,
        genreIds: data.genres?.map((genre) => genre.id),
        voteAverage: data.vote_average,
      });
    } catch (error) {
      console.error("TMDB Fetch Error:", error.message);
      throw new APIError(500, "Failed to fetch media from external API");
    }
  }

  const reviews = await Review.find({ movie: movie._id })
    .populate("owner", "username avatar")
    .sort("-createdAt");

  return res.status(200).json(new APIResponse(200, reviews, "Reviews fetched successfully"));
});

const getMovieStats = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const { mediaType } = req.query; // Added query param check

  const movie = await Movie.findOne({ tmdbId: Number(movieId), mediaType: mediaType || "movie" });
  
  if (!movie) {
    return res.status(200).json(
      new APIResponse(200, {
        counts: { Skip: 0, Timepass: 0, "Go for it": 0, Perfection: 0 },
        totalVotes: 0,
      }, "No stats available")
    );
  }

  const stats = await Review.aggregate([
    { $match: { movie: movie._id } },
    { $group: { _id: "$sentiment", count: { $sum: 1 } } },
  ]);

  const counts = {
    Skip: stats.find((s) => s._id === "Skip")?.count || 0,
    Timepass: stats.find((s) => s._id === "Timepass")?.count || 0,
    "Go for it": stats.find((s) => s._id === "Go for it")?.count || 0,
    Perfection: stats.find((s) => s._id === "Perfection")?.count || 0,
  };

  const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0);

  return res.status(200).json(
    new APIResponse(200, { counts, totalVotes, movieObjectId: movie._id }, "Stats fetched")
  );
});

const getUserReviews = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) throw new APIError(400, "UserId is required");

  const reviews = await Review.find({ owner: userId })
    .populate("movie")
    .sort("-createdAt");

  return res.status(200).json(new APIResponse(200, reviews, "User history fetched"));
});

export { addReview, getMovieReviews, getMovieStats, getUserReviews };