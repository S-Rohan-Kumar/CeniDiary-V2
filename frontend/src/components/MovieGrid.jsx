import React from 'react'
import { useMovie } from "../contexts/MovieContext.jsx"
import MovieCard from "../components/MovieCard.jsx"

function MovieGrid() {
  const {movies , loading} = useMovie()

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-6">
        <div className="relative h-24 w-24">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-600/20 to-red-800/20 blur-xl animate-pulse"></div>
          {/* Base ring */}
          <div className="absolute inset-0 rounded-full border-4 border-zinc-900/50 backdrop-blur-sm"></div>
          {/* Spinning gradient ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 border-r-red-700 animate-spin shadow-lg shadow-red-600/50"></div>
          {/* Inner dot */}
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-red-500 to-red-800 animate-pulse"></div>
        </div>
        <p className="text-zinc-500 text-lg font-medium animate-pulse">Loading movies...</p>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-32 px-4">
        <div className="bg-gradient-to-br from-zinc-900/30 to-black/50 backdrop-blur-xl border border-red-950/30 rounded-3xl p-12 text-center max-w-md shadow-2xl">
          <div className="text-6xl mb-6 opacity-50">🎬</div>
          <p className="text-2xl font-bold text-zinc-300 mb-3">No movies found</p>
          <p className="text-zinc-600 text-base">Try searching with a different keyword or phrase</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 px-6 py-4">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}

export default MovieGrid