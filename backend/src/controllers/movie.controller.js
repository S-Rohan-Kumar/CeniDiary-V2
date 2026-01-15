import axios from "axios";
import { APIResponse } from "../utils/api-response.js";
import { APIError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Movie } from "../models/movie.model.js";

const searchMovies = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query) {
    throw new APIError(400, "Query parameter is required");
  }
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_KEY}&query=${query}`
    );

    const movies = response.data.results;

    await bulkSyncMovies(movies);

    return res
      .status(200)
      .json(
        new APIResponse(
          200,
          response.data.results,
          "Movies fetched successfully"
        )
      );
  } catch (error) {
    console.log(error);
    throw new APIError(500, "Failed to fetch movies from external API");
  }
});

const getandSyncMovie = asyncHandler(async (req, res) => {
  const { tmdbId } = req.params;
  let movie = await Movie.findOne({ tmdbId });

  if (!movie) {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${process.env.TMDB_KEY}`
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
  return res
    .status(200)
    .json(new APIResponse(200, movie, "Movie fetched successfully"));
});

const bulkSyncMovies = async (movies) => {
  if (!movies || movies.length === 0) {
    return;
  }

  const ops = movies.map((movie) => ({
    updateOne: {
      filter: { tmdbId: movie.id }, // Find by TMDB ID
      update: {
        $set: {
          tmdbId: movie.id,
          title: movie.title,
          posterPath: movie.poster_path,
          backdropPath: movie.backdrop_path,
          overview: movie.overview,
          releaseDate: movie.release_date,
          genreIds: movie.genre_ids,
          voteAverage: movie.vote_average,
        },
      },
      upsert: true,
    },
  }));

  try {
    await Movie.bulkWrite(ops, { ordered: false });
  } catch (error) {
    console.error("Bulk sync error:", error);
  }
};

const getTrendingMovies = asyncHandler(async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/trending/movie/day?api_key=${process.env.TMDB_KEY}`
    );
  
    const movies = response.data.results;
  
    // Sync the entire trending list to your DB
    await bulkSyncMovies(movies);
  
    return res
      .status(200)
      .json(new APIResponse(200, movies, "Trending movies synced and fetched"));
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    throw new APIError(500, "Failed to fetch trending movies");
  }
});

export { searchMovies, getandSyncMovie , getTrendingMovies };
