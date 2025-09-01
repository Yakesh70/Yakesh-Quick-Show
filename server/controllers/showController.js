import express from "express";
import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import { inngest } from "../inngest/index.js";

// API to get now playing movies from TMDB API
export const getNowPlayingMovies = async (req, res)=>{
    try {
        console.log("Attempting to fetch now playing movies from TMDB...");
        console.log("Using TMDB_API_KEY:", process.env.TMDB_API_KEY ? "Key Found" : "Key NOT Found");

        // The key is now passed as a query parameter
        const { data } = await axios.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.TMDB_API_KEY}`);

        const movies = data.results;
        res.json({success: true, movies: movies})
    } catch (error) {
        console.error("❌ TMDB API Call Failed:", error.response?.data || error.message);
        res.json({success: false, message: error.response?.data.status_message || error.message})
    }
}

// API to add a new show to the database
export const addShow = async (req, res) =>{
    try {
        const {movieId, showsInput, showPrice} = req.body

        let movie = await Movie.findById(movieId)

        if(!movie) {
            // Fetch movie details and credits from TMDB API
            const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}`),
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${process.env.TMDB_API_KEY}`)
            ]);

            const movieApiData = movieDetailsResponse.data;
            const movieCreditsData = movieCreditsResponse.data;

             const movieDetails = {
                _id: movieId,
                title: movieApiData.title,
                overview: movieApiData.overview,
                poster_path: movieApiData.poster_path,
                backdrop_path: movieApiData.backdrop_path,
                genres: movieApiData.genres,
                casts: movieCreditsData.cast,
                release_date: movieApiData.release_date,
                original_language: movieApiData.original_language,
                tagline: movieApiData.tagline || "",
                vote_average: movieApiData.vote_average,
                runtime: movieApiData.runtime,
             }

             // Add movie to the database
             movie = await Movie.create(movieDetails);
        }

        const showsToCreate = [];
        showsInput.forEach(show => {
            const showDate = show.date;
            show.time.forEach((time)=>{
                const dateTimeString = `${showDate}T${time}`;
                showsToCreate.push({
                    movie: movieId,
                    showDateTime: new Date(dateTimeString),
                    showPrice,
                    occupiedSeats: {}
                })
            })
        });
        
        let newShows = [];
        if(showsToCreate.length > 0){
            newShows = await Show.insertMany(showsToCreate);
        }

         //  Trigger Inngest event
         await inngest.send({
            name: "app/show.added",
             data: {movieTitle: movie.title}
         })

        res.json({ success: true, message: 'Show Added successfully.', newShowId: newShows[0]?._id });
    } catch (error) {
        console.error(error);
        res.json({success: false, message: error.message})
    }
}

// API to get all shows from the database
export const getShows = async (req, res) =>{
    try {
        const shows = await Show.find({showDateTime: {$gte: new Date()}}).populate('movie').sort({ showDateTime: 1 });

        // filter unique shows
        const uniqueShows = new Set(shows.map(show => show.movie))

        res.json({success: true, shows: Array.from(uniqueShows)})
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

// API to get shows for a specific movie from the database
export const getShow = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Fetching show data for movie ID: ${id}`);
        
        // First check if movie exists in our database
        let movie = await Movie.findById(id);
        
        // If movie doesn't exist, try to fetch from TMDB
        if (!movie) {
            console.log(`Movie ${id} not found in database, fetching from TMDB...`);
            try {
                const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
                    axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}`),
                    axios.get(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${process.env.TMDB_API_KEY}`)
                ]);

                const movieApiData = movieDetailsResponse.data;
                const movieCreditsData = movieCreditsResponse.data;

                const movieDetails = {
                    _id: id,
                    title: movieApiData.title,
                    overview: movieApiData.overview,
                    poster_path: movieApiData.poster_path,
                    backdrop_path: movieApiData.backdrop_path,
                    genres: movieApiData.genres,
                    casts: movieCreditsData.cast,
                    release_date: movieApiData.release_date,
                    original_language: movieApiData.original_language,
                    tagline: movieApiData.tagline || "",
                    vote_average: movieApiData.vote_average,
                    runtime: movieApiData.runtime,
                };

                movie = await Movie.create(movieDetails);
                console.log(`Movie ${id} created in database`);
            } catch (tmdbError) {
                console.error(`TMDB API error for movie ${id}:`, tmdbError.message);
                return res.status(404).json({ success: false, message: "Movie not found" });
            }
        }
        
        // Find all shows for this movie
        const shows = await Show.find({ movie: id, showDateTime: { $gte: new Date() } }).populate('movie').sort({ showDateTime: 1 });
        console.log(`Found ${shows.length} shows for movie ${id}`);
        
        // Create show data with movie details
        const showData = {
            movie: movie,
            allShowTimes: shows.map(show => ({
                _id: show._id,
                showDateTime: show.showDateTime,
                showPrice: show.showPrice,
                occupiedSeats: show.occupiedSeats
            }))
        };
        
        res.json({ success: true, show: showData });
    } catch (error) {
        console.error("Error fetching show data:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
