import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//Middlewares
app.use(express.json({ limit: "16kb" }));
app.use(cors({
    origin: process.env.CORS_ORIGIN, 
    credentials: true
}));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

//Routes importing
import userRoute from "./routes/user.routes.js";
import libraryRoute from "./routes/library.routes.js";
import movieRoute from "./routes/movie.routes.js";
import reviewRoute from "./routes/reviews.routes.js";
import listRoute from "./routes/list.routes.js";
import socialRoute from "./routes/social.routes.js";



//Routes
app.use("/api/v1/users", userRoute);

//Movie Routes
app.use("/api/v1/movies", movieRoute);

//Library Routes
app.use("/api/v1/library", libraryRoute);

//Review Routes
app.use("/api/v1/reviews", reviewRoute);

//List Routes
app.use("/api/v1/lists", listRoute);

//Social Routes
app.use("/api/v1/social", socialRoute);

export { app };
