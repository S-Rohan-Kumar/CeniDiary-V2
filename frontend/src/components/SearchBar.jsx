import React, { useState } from 'react'
import { useMovie } from "../contexts/MovieContext.jsx"

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const { fetchMovies } = useMovie()

  const handleSubmit = (e) =>{
    e.preventDefault()
    if(query.trim()) fetchMovies(query)
  }
  
  return (
    <div className="flex justify-center mb-10 md:mb-20 px-4">
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col sm:flex-row w-full max-w-3xl gap-3 sm:gap-4 p-2 sm:p-3 bg-gradient-to-br from-zinc-900/30 via-black/40 to-zinc-950/60 backdrop-blur-2xl border border-red-950/40 rounded-3xl sm:rounded-[2rem] shadow-2xl shadow-black/60 transition-all duration-500 hover:border-red-800/40 group"
      >
        {/* Input Group */}
        <div className="flex flex-1 items-center bg-black/20 sm:bg-transparent rounded-2xl sm:rounded-none px-3">
          <div className="text-zinc-600 text-lg mr-2"></div>
          <input
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent py-3 outline-none text-white placeholder:text-zinc-600 text-base sm:text-lg font-medium"
          />
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="relative overflow-hidden bg-gradient-to-r from-red-600/40 to-red-800/40 hover:from-red-600/60 hover:to-red-800/60 text-red-400 hover:text-red-300 border border-red-700/40 font-bold py-3 sm:px-10 rounded-2xl transition-all duration-300 active:scale-95 backdrop-blur-xl"
        >
          <span className="relative z-10">Search</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
        </button>

        {/* Glow effect on focus (Hidden on very small screens to save performance) */}
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-800/0 rounded-[2rem] opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-500 -z-10 pointer-events-none hidden sm:block"></div>
      </form>
    </div>
  );
}