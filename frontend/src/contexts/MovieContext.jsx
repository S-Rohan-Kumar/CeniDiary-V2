import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const MovieContext = createContext();

export const MovieProvider = ({ children }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async (query = "") => {
    setLoading(true);
    try {
      const endpoint = query
        ? `/api/v1/movies/search?query=${query}` 
        : `/api/v1/movies/trending`;          

      const response = query 
        ? await axios.get(endpoint) 
        : await axios.post(endpoint);

      const fetchedMovies = response.data.data || [];
      setMovies(fetchedMovies);
    } catch (error) {
      console.error("Movie sync error:", error.response?.data || error.message);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (movie) => {
    setFavorites((prev) => {
      return prev.some((m) => m.id === movie.id)
        ? prev.filter((m) => m.id !== movie.id)
        : [...prev, movie];
    });
  };

  return (
    <MovieContext.Provider
      // ADD setMovies AND setLoading TO THE VALUE OBJECT
      value={{ movies, setMovies, favorites, loading, setLoading, toggleFavorite, fetchMovies }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export const useMovie = () => useContext(MovieContext);