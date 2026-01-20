// Home.jsx

import React, { useEffect } from 'react';
import SearchBar from '../components/SearchBar.jsx';
import MovieGrid from '../components/MovieGrid.jsx';
import { useAuth } from "../contexts/AuthContext.jsx";
import { useMovie } from "../contexts/MovieContext.jsx";

const Home = () => {
  const { user } = useAuth();
  const { fetchMovies } = useMovie();

  useEffect(() => {
    fetchMovies(); 
  }, [user]);

  return (
    <div className="p-10 text-left min-h-screen bg-black">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter bg-gradient-to-r from-white via-red-200 to-red-600 bg-clip-text text-transparent uppercase italic">
          Explore Cinema
        </h1>
        <p className="text-zinc-500 text-xl font-medium italic opacity-80 uppercase tracking-widest">
          Your personal journey through Movies & Web Series
        </p>
      </div>
      
      <SearchBar />
      
      <MovieGrid />
    </div>
  );
};

export default Home;