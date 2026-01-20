import React from 'react'
import { useMovie } from "../contexts/MovieContext.jsx"
import MovieCard from "../components/MovieCard.jsx"

function MovieGrid() {
  const { movies, loading } = useMovie()

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-6">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-600/20 to-red-800/20 blur-xl animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-zinc-900/50 backdrop-blur-sm"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 border-r-red-700 animate-spin shadow-lg shadow-red-600/50"></div>
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-red-500 to-red-800 animate-pulse"></div>
        </div>
        <p className="text-zinc-500 text-lg font-black uppercase italic tracking-widest animate-pulse">Syncing Cinema...</p>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-32 px-4">
        <div className="bg-gradient-to-br from-zinc-900/30 to-black/50 backdrop-blur-xl border border-white/5 rounded-[3rem] p-16 text-center max-w-md shadow-2xl">
          <div className="text-6xl mb-6 opacity-30">📽️</div>
          <p className="text-2xl font-black italic uppercase tracking-tighter text-zinc-300 mb-3">The Vault is Empty</p>
          <p className="text-zinc-600 text-sm font-medium italic">Try searching with a different cinematic keyword</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10 px-8 py-10">
      {movies.map((movie) => (
        <MovieCard key={`${movie.media_type}-${movie.id}`} movie={movie} />
      ))}
    </div>
  )
}

export default MovieGrid