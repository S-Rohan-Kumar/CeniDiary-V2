import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ 
    movie: null, 
    cast: [], 
    director: '', 
    providers: null 
  });
  
  const API_KEY = import.meta.env.VITE_TMDB_KEY;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&append_to_response=credits,watch/providers`
        );
        const result = await res.json();
        
        const directorInfo = result.credits?.crew.find(person => person.job === 'Director');
        const watchProviders = result['watch/providers']?.results?.IN;

        setData({
          movie: result,
          cast: result.credits?.cast.slice(0, 6) || [],
          director: directorInfo ? directorInfo.name : 'Unknown',
          providers: watchProviders
        });
      } catch (error) {
        console.error("Error loading movie info:", error);
      }
    };
    fetchAllData();
    window.scrollTo(0, 0);
  }, [id]);

  if (!data.movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-600/20 to-red-800/20 blur-xl animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-zinc-900/50"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 border-r-red-700 animate-spin"></div>
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-red-500 to-red-800 animate-pulse"></div>
        </div>
        <p className="text-red-500 font-bold text-xl animate-pulse">Fetching Movie Details...</p>
      </div>
    );
  }

  const { movie, cast, director, providers } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-white p-6 md:p-12 font-sans">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="group mb-10 px-6 py-3 bg-gradient-to-r from-zinc-900/40 to-black/60 backdrop-blur-2xl border border-red-950/40 rounded-2xl hover:border-red-700/50 hover:shadow-lg hover:shadow-red-900/20 transition-all duration-300 text-base font-semibold hover:-translate-x-1 flex items-center gap-2"
      >
        <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
        <span>Back to Browse</span>
      </button>

      <div className="max-w-7xl mx-auto">
        {/* Main Content Card */}
        <div className="flex flex-col lg:flex-row gap-10 bg-gradient-to-br from-zinc-900/30 via-black/50 to-zinc-950/70 backdrop-blur-3xl border border-red-950/30 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          
          {/* Ambient Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-900/10 to-red-950/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-zinc-900/10 to-black/10 rounded-full blur-3xl -z-10"></div>
          
          {/* LEFT COLUMN: Poster & Actions */}
          <div className="w-full lg:w-[420px] shrink-0 flex flex-col gap-6">
            {/* Poster with Glow */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-br from-red-700/30 to-red-900/30 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img 
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                className="relative w-full rounded-[2rem] shadow-2xl border-2 border-red-950/30 transition-all duration-500 hover:scale-[1.02] hover:border-red-800/40"
                alt={movie.title}
              />
            </div>
            
            {/* Watch Now Button */}
            {movie.homepage ? (
              <a 
                href={movie.homepage} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group relative w-full text-center py-5 bg-gradient-to-r from-red-600 via-red-700 to-red-600 bg-size-200 bg-pos-0 hover:bg-pos-100 rounded-[1.5rem] font-black text-xl overflow-hidden transition-all duration-500 active:scale-95 shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_50px_rgba(220,38,38,0.7)] border border-red-600/30"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <span>▶</span>
                  <span>WATCH NOW</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              </a>
            ) : (
              <div className="w-full text-center py-5 bg-gradient-to-r from-zinc-900/50 to-black/50 backdrop-blur-xl rounded-[1.5rem] text-zinc-600 font-bold border border-red-950/30">
                NOT AVAILABLE ONLINE
              </div>
            )}
          </div>
          
          {/* RIGHT COLUMN: Movie Information */}
          <div className="flex-1">
            {/* Title & Year */}
            <div className="flex items-baseline gap-5 mb-3 flex-wrap">
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight bg-gradient-to-br from-white via-red-100 to-red-300 bg-clip-text text-transparent">
                {movie.title}
              </h1>
              <span className="text-zinc-500 text-3xl font-light bg-red-950/20 px-4 py-1 rounded-2xl border border-red-950/30">
                {movie.release_date?.split("-")[0]}
              </span>
            </div>
            
            {/* Tagline */}
            <p className="text-red-400/90 text-xl italic mb-10 font-medium">
              {movie.tagline ? `"${movie.tagline}"` : ""}
            </p>

            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              {/* Rating */}
              <div className="flex items-center gap-2.5 bg-gradient-to-r from-amber-600/20 to-yellow-600/20 backdrop-blur-xl px-5 py-3 rounded-2xl border border-amber-600/40 shadow-lg shadow-amber-900/20">
                <span className="text-amber-500 font-bold text-2xl">★</span>
                <span className="text-amber-400 font-black text-lg">{movie.vote_average.toFixed(1)}</span>
                <span className="text-amber-500/60 text-sm font-medium">/10</span>
              </div>
              
              {/* Runtime */}
              <div className="bg-gradient-to-r from-zinc-900/40 to-black/60 backdrop-blur-xl px-5 py-3 rounded-2xl border border-red-950/40 text-zinc-300 font-bold text-base shadow-lg flex items-center gap-2">
                <span>⏱</span>
                <span>{movie.runtime} min</span>
              </div>
              
              {/* Director */}
              <div className="bg-gradient-to-r from-red-700/20 to-red-800/20 backdrop-blur-xl px-5 py-3 rounded-2xl border border-red-700/40 text-red-400 font-bold text-base shadow-lg shadow-red-900/20 flex items-center gap-2">
                <span>🎬</span>
                <span>{director}</span>
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-3 mb-12">
              {movie.genres.map(g => (
                <span 
                  key={g.id} 
                  className="bg-gradient-to-r from-red-950/20 to-zinc-900/30 backdrop-blur-xl text-zinc-300 px-5 py-2 rounded-full text-sm border border-red-950/40 tracking-wider uppercase font-semibold hover:border-red-700/50 hover:from-red-800/20 hover:to-red-900/20 transition-all duration-300"
                >
                  {g.name}
                </span>
              ))}
            </div>

            {/* Story Section */}
            <div className="mb-12 p-6 bg-gradient-to-br from-red-950/10 to-black/0 backdrop-blur-md rounded-3xl border border-red-950/30">
              <h2 className="text-xs uppercase tracking-[0.3em] text-red-500 font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                THE STORY
              </h2>
              <p className="text-zinc-300 text-lg leading-relaxed">{movie.overview}</p>
            </div>

            {/* Streaming Providers */}
            {providers?.flatrate && (
              <div className="mb-12 p-6 bg-gradient-to-br from-red-900/10 via-red-950/10 to-transparent backdrop-blur-xl rounded-3xl border border-red-800/30 shadow-lg shadow-red-950/10">
                <h3 className="text-xs uppercase tracking-widest text-red-400 mb-5 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  STREAM ON
                </h3>
                <div className="flex flex-wrap gap-4">
                  {providers.flatrate.map(p => (
                    <div key={p.provider_id} className="group relative">
                      <div className="absolute -inset-1 bg-gradient-to-br from-red-700/30 to-red-900/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <img 
                        src={`https://image.tmdb.org/t/p/original${p.logo_path}`} 
                        className="relative w-16 h-16 rounded-2xl shadow-lg border-2 border-red-950/30 group-hover:border-red-700/60 hover:scale-110 transition-all duration-300" 
                        title={p.provider_name} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cast Section */}
            <div className="p-6 bg-gradient-to-br from-red-950/10 to-transparent backdrop-blur-md rounded-3xl border border-red-950/30">
              <h2 className="text-xs uppercase tracking-[0.3em] text-red-500 font-bold mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                TOP CAST
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
                {cast.map(person => (
                  <div key={person.id} className="text-center group">
                    <div className="relative aspect-square mb-3">
                      <div className="absolute -inset-1 bg-gradient-to-br from-red-700/20 to-red-900/20 rounded-[1.5rem] blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <img 
                        src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : 'https://via.placeholder.com/185x278'} 
                        className="relative w-full h-full object-cover rounded-[1.5rem] border-2 border-red-950/30 group-hover:border-red-700/60 transition-all duration-300 group-hover:scale-105"
                        alt={person.name}
                      />
                    </div>
                    <p className="text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors">{person.name}</p>
                    <p className="text-[10px] text-zinc-600 truncate mt-1 uppercase tracking-wider">{person.character}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}