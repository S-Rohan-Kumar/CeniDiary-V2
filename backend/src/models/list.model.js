import mongoose,{ Schema } from "mongoose";

const listSchema = new Schema({
    title : {
        type: String,
        required: true,
        trim : true
    },
    descriptoin : {
        type: String,
        trim : true,
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
}, { timestamps: true });

export const List = mongoose.model("List", listSchema);