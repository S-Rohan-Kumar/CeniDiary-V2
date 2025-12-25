import { useMovie } from "../contexts/MovieContext.jsx"
import MovieCard from "../components/MovieCard.jsx"

export default function Favorites() {
    const { favorites } = useMovie();
    return (
      <div className="min-h-screen bg-slate-950 p-8">
        <h1 className="text-4xl font-black mb-10 text-white">Your CiniDiary</h1>

        {favorites.length === 0 ? (
          <div className="text-center mt-20 text-slate-500">
            <p className="text-2xl mb-4">Your diary is empty! 📖</p>
            <p>Add some movies to your favorites to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {favorites.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    );
}