import mongoose,{ Schema } from "mongoose";

const collectionSchema = new Schema({
    title  :{
        type: String,
        required: true,
        trim : true
    },
    description : {
        type: String,
        trim : true
    },
    movies : [{
        type: mongoose.Schema.Types.ObjectId,
        ref : "Movie"
    }],
    owner : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    isPublic: {
        type: Boolean,
        default: true 
    },
    badges: [{
        name: String,
        unlockedAt: Date
    }], 
}, { timestamps: true });