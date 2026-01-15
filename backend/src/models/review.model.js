import mongoose, { Schema } from 'mongoose';

const reviewSchema = new Schema({
    sentiment : {
        type : String,
        required : true,
        enum : ['Skip' , 'Timepass' , 'Go for it', 'Perfection']
    },
    comment : {
        type : String,
        required : true,
        trim : true,
    },
    owner : {
        type : Schema.Types.ObjectId,
        ref : 'User',
    },
    movie : {
        type : Schema.Types.ObjectId,
        ref : 'Movie'
    }
},
    { timestamps : true }
);

export const Review = mongoose.model('Review' , reviewSchema);