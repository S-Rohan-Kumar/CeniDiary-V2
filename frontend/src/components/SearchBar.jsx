import React, { useState, useEffect } from 'react';
import { useMovie } from "../contexts/MovieContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Link } from "react-router-dom";
import axios from "axios";

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const { setMovies, setLoading } = useMovie(); 
  const { user } = useAuth();
  const [userResults, setUserResults] = useState([]);

  const API_KEY = import.meta.env.VITE_TMDB_KEY;

  useEffect(() => {
    if (user && query.trim()) {
      handleGlobalSearch();
    }
  }, [user]);

  const handleGlobalSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const movieRes = await axios.get(
        `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${query}`
      );
      
      const cinemaResults = movieRes.data.results.filter(
        item => item.media_type === "movie" || item.media_type === "tv"
      );
      setMovies(cinemaResults);

      const userRes = await axios.get(`/api/v1/social/search?username=${query}`);
      setUserResults(userRes.data.data || []);

    } catch (err) {
      console.error("Global search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mb-10 md:mb-20 px-4">
      <form
        onSubmit={handleGlobalSearch}
        className="relative flex flex-col sm:flex-row w-full max-w-3xl gap-3 sm:gap-4 p-2 sm:p-3 bg-gradient-to-br from-zinc-900/30 via-black/40 to-zinc-950/60 backdrop-blur-2xl border border-red-950/40 rounded-3xl sm:rounded-[2rem] shadow-2xl transition-all duration-500 hover:border-red-800/40 group"
      >
        <div className="flex flex-1 items-center px-3">
          <input
            type="text"
            placeholder="Search cinema or members..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent py-3 outline-none text-white placeholder:text-zinc-600 text-base sm:text-lg font-medium italic"
          />
        </div>
        <button type="submit" className="relative overflow-hidden bg-gradient-to-r from-red-600/40 to-red-800/40 text-red-400 font-bold py-3 sm:px-10 rounded-2xl transition-all active:scale-95 italic">
          Search
        </button>
      </form>

      {userResults.length > 0 && (
        <div className="w-full max-w-3xl mt-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-5 italic ml-2">People</h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {userResults.map(u => (
              <Link to={`/u/${u.username}`} key={u._id} className="flex items-center gap-3 bg-[#111] border border-white/5 p-3 pr-8 rounded-2xl hover:border-red-600 transition-all shrink-0">
                <img src={u.avatar} className="w-10 h-10 rounded-full object-cover border border-zinc-800" alt="avatar" />
                <span className="text-xs font-black italic uppercase text-zinc-300">{u.username}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}