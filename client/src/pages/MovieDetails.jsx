import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Heart, PlayCircleIcon, StarIcon } from "lucide-react";
import BlurCircle from "../components/BlurCircle";
import timeFormat from "../lib/timeFormat";
import DateSelect from "../components/DateSelect";
import MovieCard from "../components/MovieCard";
import { useAppContext } from "../context/AppContext";
import Loading from "../components/Loading";
import toast from "react-hot-toast";
import { SignInButton } from "@clerk/clerk-react";

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    shows,
    axios,
    getToken,
    user,
    fetchFavoriteMovies,
    favoriteMovies,
    image_base_url,
  } = useAppContext();

  // Fetch single show/movie details
  const getShow = async () => {
    try {
      console.log(`Fetching movie details for ID: ${id}`);
      const { data } = await axios.get(`/api/show/${id}`);
      console.log('API Response:', data);
      if (data.success) {
        setShow(data.show);
      } else {
        setError(data.message || "Failed to retrieve show details.");
        console.error("API response was not successful:", data.message);
      }
    } catch (err) {
      setError("There was a problem fetching the show data.");
      console.error("Failed to fetch show data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle add/remove favorite
  const handleFavorite = async () => {
    try {
      if (!user) return toast.error("Please login to proceed");

      const { data } = await axios.post(
        "/api/user/update-favorite",
        { movieId: id },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        await fetchFavoriteMovies();
        toast.success(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getShow();
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-20">
        <p className="text-lg font-semibold">{error}</p>
        <p className="text-sm mt-2">Please check the console for more details.</p>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="text-center text-lg font-semibold mt-20">
        No show details found.
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  const handleBookTickets = () => {
    if (!user) {
      toast.error("Please login to book tickets");
      return;
    }
    navigate(`/movies/${id}/${today}`);
  };

  return (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        <img
          src={image_base_url + show.movie.poster_path}
          alt={show.movie.title}
          className="max-md:mx-auto rounded-xl h-104 max-w-70 object-cover"
        />

        <div className="relative flex flex-col gap-3">
          <BlurCircle top="-100px" left="-100px" />
          <p className="text-primary">ENGLISH</p>
          <h1 className="text-4xl font-semibold max-w-96 text-balance">
            {show.movie.title}
          </h1>

          <div className="flex items-center gap-2 text-gray-300">
            <StarIcon className="w-5 h-5 text-primary fill-primary" />
            {show.movie.vote_average?.toFixed(1)} User Rating
          </div>

          <p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">
            {show.movie.overview}
          </p>

          <p>
            {show.movie.runtime ? timeFormat(show.movie.runtime) : 'N/A'} •{" "}
            {show.movie.genres?.map((genre) => genre.name).join(", ") || 'N/A'} •{" "}
            {show.movie.release_date?.split("-")[0] || 'N/A'}
          </p>

          {/* Buttons */}
          <div className="flex items-center flex-wrap gap-4 mt-4">
            <button className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95">
              <PlayCircleIcon className="w-5 h-5" />
              Watch Trailer
            </button>

            <button
              onClick={handleFavorite}
              className="bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95"
            >
              <Heart
                className={`w-5 h-5 ${
                  favoriteMovies.find((m) => m._id === id)
                    ? "fill-primary text-primary"
                    : ""
                }`}
              />
            </button>

            {user ? (
              <button
                onClick={handleBookTickets}
                className="flex items-center gap-2 px-7 py-3 text-sm bg-primary hover:bg-primary/80 transition rounded-md font-medium cursor-pointer active:scale-95"
              >
                🎟 Book Tickets
              </button>
            ) : (
              <SignInButton mode="modal">
                <button className="flex items-center gap-2 px-7 py-3 text-sm bg-primary hover:bg-primary/80 transition rounded-md font-medium cursor-pointer active:scale-95">
                  🎟 Login to Book Tickets
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>

      {/* Favorite Cast */}
      {show.movie.casts && show.movie.casts.length > 0 && (
        <>
          <p className="text-lg font-medium mt-20">Your Favorite Cast</p>
          <div className="overflow-x-auto no-scrollbar mt-8 pb-4">
            <div className="flex items-center gap-4 w-max px-4">
              {show.movie.casts.slice(0, 12).map((cast, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <img
                    src={cast.profile_path ? image_base_url + cast.profile_path : '/placeholder-avatar.png'}
                    alt={cast.name}
                    className="rounded-full h-20 md:h-20 aspect-square object-cover"
                  />
                  <p className="font-medium text-xs mt-3">{cast.name}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Date Selection */}
      {show.allShowTimes && show.allShowTimes.length > 0 && (() => {
        // Group show times by date
        const dateTimeGrouped = show.allShowTimes.reduce((acc, showTime) => {
          const date = new Date(showTime.showDateTime).toISOString().split('T')[0];
          if (!acc[date]) acc[date] = [];
          acc[date].push(showTime);
          return acc;
        }, {});
        
        return <DateSelect dateTime={dateTimeGrouped} id={id} />;
      })()}

      {/* You May Also Like */}
      <p className="text-lg font-medium mt-20 mb-8">You May Also Like</p>
      <div className="flex flex-wrap max-sm:justify-center gap-8">
        {shows.slice(0, 4).map((movie, index) => (
          <MovieCard key={index} movie={movie} />
        ))}
      </div>

      {/* Show More Button */}
      <div className="flex justify-center mt-20">
        <button
          onClick={() => {
            navigate("/movies");
            scrollTo(0, 0);
          }}
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
        >
          Show more
        </button>
      </div>
    </div>
  );
};

export default MovieDetails;
