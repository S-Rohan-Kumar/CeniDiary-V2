import { APIResponse } from "../utils/api-response.js";
import { APIError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Review } from "../models/review.model.js";
import { Movie } from "../models/movie.model.js";
import { User } from "../models/user.model.js";
import axios from "axios";


const addReview = asyncHandler(async (req, res) => {
    const {comment , sentiment , movieId} = req.body;
    let movie = await Movie.findOne({tmdbId : movieId});
    if(!movie){
        throw new APIError('Movie not found' , 404);
    }
    if(!comment || !sentiment || !movieId){
        throw new APIError(400 , 'Comment, Sentiment and MovieId are required' );
    }

    if(!['Skip' , 'Timepass' , 'Go for it', 'Perfection'].includes(sentiment)){
        throw new APIError(400 , 'Invalid sentiment value');
    }

    const review = await Review.create({
        comment,
        sentiment,
        owner : req.user._id,
        movie : movie._id
    });

    if(!review){
        throw new APIError(500 , 'Unable to add review');
    }

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $addToSet: { watchHistory: movie._id },
            $pull: { watchlist: movie._id },     
            $inc: { watchNumber: 1 }            
        }
    );

    return res
        .status(201)
        .json(new APIResponse(201, review, "Review added successfully"));

})

const getMovieReviews = asyncHandler(async (req, res) => {
    const { movieId } = req.params;
    let movie = await Movie.findOne({tmdbId : movieId});
    if(!movie){
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
    const reviews = await Review.find({ movie: movie._id })
        .populate("owner", "username avatar") 
        .sort("-createdAt");

    return res
        .status(200)
        .json(new APIResponse(200, reviews, "Movie reviews fetched successfully"));
});

export { addReview, getMovieReviews };