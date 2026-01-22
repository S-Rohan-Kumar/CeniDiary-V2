import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//Middlewares
app.use(express.json({ limit: "16kb" }));
app.use(cors({
    origin: [
        "https://ceni-diary-v2.vercel.app",
        "http://localhost:5173/"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
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


app.get("/ping", (req, res) => {
  res.status(200).send("Server is alive");
});
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
