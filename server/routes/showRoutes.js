import express from "express";
import { addShow, getNowPlayingMovies, getShow, getShows } from "../controllers/showController.js";
import { protect, protectAdmin } from '../middleware/auth.js';

const showRouter = express.Router();

showRouter.get('/now-playing', getNowPlayingMovies); // No protection, so all users can see now playing movies
showRouter.post('/add', ...protectAdmin, addShow);
showRouter.get("/all", getShows);
showRouter.get("/:id", getShow);

export default showRouter;