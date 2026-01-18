import React from 'react';
import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  // Logic for favorites is removed here to keep the grid focused on discovery.
  // All user actions now happen on the Movie Details page.

  return (
    <Link to={`/movie/${movie.id}`}>
      <div className="group relative bg-gradient-to-br from-zinc-900/40 via-black/60 to-zinc-950/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-red-950/30 hover:border-red-600/60 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-red-900/30 shadow-xl">
        
        {/* Poster Image Section */}
        <div className="aspect-[2/3] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-70 group-hover:opacity-50 transition-opacity duration-500"></div>
          <img
            src={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : "https://via.placeholder.com/500x750?text=No+Poster"
            }
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          
          {/* Subtle Red Glow on Hover */}
          <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
        </div>

        {/* Movie Info Section */}
        <div className="p-5 bg-gradient-to-t from-black/95 via-zinc-950/80 to-transparent backdrop-blur-md">
          <h3 className="font-bold text-lg truncate text-white mb-2.5 group-hover:text-red-400 transition-colors duration-300">
            {movie.title}
          </h3>
          
          <div className="flex items-center justify-between gap-3">
            {/* Rating Badge */}
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600/20 to-yellow-600/20 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-amber-600/30">
              <span className="text-amber-500 text-lg">★</span>
              <span className="text-amber-400 font-bold text-sm">
                {movie.vote_average?.toFixed(1) || "N/A"}
              </span>
            </div>

            {/* Release Year Badge */}
            <span className="text-zinc-500 text-sm font-medium bg-red-950/20 px-3 py-1.5 rounded-xl border border-red-950/30 uppercase tracking-tighter">
              {movie.release_date ? movie.release_date.split("-")[0] : "TBA"}
            </span>
          </div>
        </div>

        {/* Shine Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      </div>
    </Link>
  );
}