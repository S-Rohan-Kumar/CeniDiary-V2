import mongoose, { Schema } from "mongoose";

const movieSchema = new Schema(
  {
    tmdbId: {
      type: Number,
      required: true,
      index: true,
    },
    mediaType: {
      type: String,
      required: true,
      enum: ["movie", "tv"],
      default: "movie",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    posterPath: {
      type: String,
      required: true,
    },
    backdropPath: {
      type: String,
      required: true,
    },
    overview: {
      type: String,
    },
    releaseDate: {
      type: String,
    },
    genreIds: [
      {
        type: Number,
      },
    ],
    voteAverage: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

movieSchema.index({ tmdbId: 1, mediaType: 1 }, { unique: true });

export const Movie = mongoose.model("Movie", movieSchema);