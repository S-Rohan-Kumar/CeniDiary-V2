import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

//Middlewares
app.use(express.json({limit: '16kb'}));
app.use(cors());
app.use(express.urlencoded({extended: true, limit : "16kb"}))
app.use(cookieParser());

//Routes


export { app };