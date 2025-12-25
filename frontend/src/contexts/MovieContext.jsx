import { createContext , useContext , useState , useEffect } from "react";

const MovieContext = createContext();

export const MovieProvider = ({ children }) =>{
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [favorites, setFavorites] = useState(() =>{
        const saved = JSON.parse(localStorage.getItem("favorites"));
        return saved || [];
    });

    useEffect(() =>{
        const saved = JSON.parse(localStorage.getItem("favorites"));
        if(saved){
            setFavorites(saved);
        }
    },[]);

    useEffect(() =>{
        localStorage.setItem("favorites", JSON.stringify(favorites));
    },[favorites]);

    useEffect(() => {
      fetchMovies();
    }, []);
    
  const API_KEY = import.meta.env.VITE_TMDB_KEY;
  const BASE_URL = 'https://api.themoviedb.org/3';

    const fetchMovies = async (query ="") =>{
        setLoading(true);
        try {
            const endpoint = query 
        ? `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`
        : `${BASE_URL}/trending/movie/day?api_key=${API_KEY}`;
        const response = await fetch(endpoint);
        const data = await response.json();
        console.log(data);
        setMovies(data.results || []);
        setLoading(false);
        } catch (error) {
            console.log("Could not fetch movies " , error)
        }
    }

    const toggleFavorite = (movie) => {
      setFavorites((prev) => {
        return prev.some((m) => m.id === movie.id)
          ? prev.filter((m) => m.id !== movie.id)
          : [...prev, movie];
      });
    };

    return (
        <MovieContext.Provider value={{ movies , favorites  , loading , toggleFavorite , fetchMovies} }>
            {children}
        </MovieContext.Provider>
    )

}


export const useMovie = () => useContext(MovieContext);