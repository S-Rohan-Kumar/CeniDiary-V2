import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";

export default function SearchPage() {
  const { user } = useAuth(); // Monitor auth state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ movies: [], users: [] });
  const [loading, setLoading] = useState(false);

  // LOGIC: This solves the "need to refresh" issue
  useEffect(() => {
    if (user && query) {
      handleSearch(); // Auto-refresh results when user logs in
    }
  }, [user]); // Runs whenever the 'user' object changes

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query) return;

    setLoading(true);
    try {
      const movieRes = await axios.get(
        `https://api.themoviedb.org/3/search/multi?query=${query}&api_key=YOUR_TMDB_KEY`
      );
      
      // 2. Fetch Users from your Social Backend
      const userRes = await axios.get(`/api/v1/social/search?username=${query}`);

      setResults({
        movies: movieRes.data.results.filter(item => item.media_type !== "person"),
        users: userRes.data.data
      });
    } catch (err) {
      console.error("Global search failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-12">
          Explore <span className="text-red-600">Cinema</span>
        </h1>

        <form onSubmit={handleSearch} className="mb-20">
          <div className="relative">
            <input 
              type="text" 
              className="w-full bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 italic font-bold outline-none focus:border-red-600 transition-all text-xl"
              placeholder="Search movies, web series, or users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-600 px-8 py-3 rounded-2xl font-black uppercase text-xs italic shadow-xl shadow-red-600/20 active:scale-95 transition-all">
              Search
            </button>
          </div>
        </form>

        {loading ? (
          <div className="text-center py-20 font-black italic text-red-600 animate-pulse text-3xl uppercase">Syncing the Vault...</div>
        ) : (
          <div className="space-y-24">
            {/* PEOPLE SECTION */}
            {results.users.length > 0 && (
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-8 italic">CeniDiary Members</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.users.map(u => (
                    <Link to={`/u/${u.username}`} key={u._id} className="bg-[#1A1A1A] p-6 rounded-[2.5rem] border border-white/5 flex items-center gap-5 hover:border-red-600 transition-all group">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-zinc-800 group-hover:border-red-600 transition-all">
                        <img src={u.avatar} className="w-full h-full object-cover" alt="avatar" />
                      </div>
                      <div>
                        <p className="font-black italic text-lg leading-none uppercase">{u.username}</p>
                        <p className="text-[10px] text-zinc-500 font-bold lowercase mt-1 italic">@{u.username}_2026</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* CINEMA SECTION */}
            <section>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-8 italic">Cinematic Results</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                {results.movies.map(movie => (
                  <Link to={`/movie/${movie.id}`} key={movie.id} className="group aspect-[2/3] bg-[#1A1A1A] rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-red-600 transition-all shadow-2xl relative">
                    <img 
                      src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "https://via.placeholder.com/500x750?text=No+Poster"} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                      alt="poster" 
                    />
                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-all">
                       <p className="font-black italic text-[10px] uppercase tracking-tighter truncate">{movie.title || movie.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}