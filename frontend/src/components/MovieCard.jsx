import React from 'react';
import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  const displayName = movie.title || movie.name;
  
  const displayDate = (movie.release_date || movie.first_air_date)?.split("-")[0] || "TBA";
  
  const mediaType = movie.media_type || 'movie';

  return (
    <Link to={`/detail/${mediaType}/${movie.id}`}>
      <div className="group relative bg-gradient-to-br from-zinc-900/40 via-black/60 to-zinc-950/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-red-950/30 hover:border-red-600/60 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-red-900/30 shadow-xl">
        
        
        <div className="aspect-[2/3] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-70 group-hover:opacity-50 transition-opacity duration-500"></div>
          <img
            src={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : "https://ui-avatars.com/api/?name=" + displayName + "&background=18181b&color=fff"
            }
            alt={displayName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          
          
          <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
          
          <div className="absolute top-4 right-4 z-20">
            <span className="bg-black/60 backdrop-blur-md text-[8px] font-black uppercase tracking-widest text-white px-3 py-1 rounded-full border border-white/10 italic">
              {mediaType === 'tv' ? 'Series' : 'Movie'}
            </span>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-t from-black/95 via-zinc-950/80 to-transparent backdrop-blur-md text-left">
          <h3 className="font-bold text-lg truncate text-white mb-2.5 group-hover:text-red-400 transition-colors duration-300 italic uppercase tracking-tighter">
            {displayName}
          </h3>
          
          <div className="flex items-center justify-between gap-3">
            
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600/20 to-yellow-600/20 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-amber-600/30">
              <span className="text-amber-500 text-lg">★</span>
              <span className="text-amber-400 font-black text-sm italic">
                {movie.vote_average?.toFixed(1) || "N/A"}
              </span>
            </div>

            <span className="text-zinc-500 text-[10px] font-black bg-red-950/20 px-3 py-1.5 rounded-xl border border-red-950/30 uppercase tracking-widest italic">
              {displayDate}
            </span>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      </div>
    </Link>
  );
}