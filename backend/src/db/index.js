import mongoose from "mongoose";

import {DB_NAME} from "../constants.js"

const connectDB  = async () => {
    try {
        const connetionInstance = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
        console.log(`✔️ Mongo DB connected | DB host : ${connetionInstance.connection.host}`)
    } catch (error) {
        console.log("❌ Mongoose connection failed !", error);
        process.exit(1)
    }
}

export default connectDB;