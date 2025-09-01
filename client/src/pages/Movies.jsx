import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAppContext } from "../context/AppContext"
import Loading from "../components/Loading"

const Movies = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const { axios, image_base_url } = useAppContext()

  const fetchMovies = async () => {
    try {
      const { data } = await axios.get('/api/show/now-playing')
      if (data.success) {
        setMovies(data.movies.slice(0, 20)) // Show first 20 movies
      }
    } catch (error) {
      console.error('Error fetching movies:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMovies()
  }, [])

  if (loading) return <Loading />

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {movies.map((movie) => (
        <div
          key={movie.id}
          className="bg-zinc-900 rounded-2xl shadow-lg overflow-hidden"
        >
          <img
            src={image_base_url + movie.poster_path}
            alt={movie.title}
            className="w-full h-64 object-cover"
          />
          <div className="p-4">
            <h2 className="text-xl font-bold line-clamp-2">{movie.title}</h2>
            <p className="text-sm text-gray-400">
              {movie.release_date?.split('-')[0]} | ⭐ {movie.vote_average?.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {movie.adult ? '18+' : 'PG'} | 👥 {movie.popularity?.toFixed(0)} | 🗣️ {movie.original_language?.toUpperCase()}
            </p>
            <p className="text-gray-300 mt-2 text-sm line-clamp-2">{movie.overview}</p>

            <Link
              to={`/movies/${movie.id}`}
              className="mt-3 inline-block bg-primary px-4 py-2 rounded-xl text-white text-sm hover:bg-primary/80 transition"
            >
              🎬 View Details & Book
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Movies
