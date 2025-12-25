import mongoose ,{ Schema } from "mongoose";

const movieSchema = new Schema({
    tmdbId : {
        type : Number,
        required : true,
        unique : true,
        index : true
    },
    title : {
        type : String,
        required : true,
        trim : true
    },
    posterPath : {
        type : String,
        required : true
    },
    backdropPath : {
        type : String,
        required : true
    },
    overview: {
        type: String
    },
    releaseDate: {
        type: String
    },
    genreIds: [{
        type: Number
    }],
    voteAverage: {
        type: Number
    }    
},{
    timestamps : true
})

export const Movie = mongoose.model("Movie", movieSchema);