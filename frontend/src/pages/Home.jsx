import SearchBar from '../components/SearchBar.jsx'
import MovieGrid from '../components/MovieGrid.jsx'

const Home = () => {
  return (
    <div className="p-10">
      <div className="text-center mb-16">
        <h1 className="text-6xl md:text-7xl font-black mb-4 tracking-tighter bg-gradient-to-r from-white via-red-200 to-red-400 bg-clip-text text-transparent">
          Explore Cinema
        </h1>
        <p className="text-zinc-500 text-lg font-medium">
          Your personal movie logging journey.
        </p>
      </div>
      
      {/* These components handle the actual movie fetching logic */}
      <SearchBar />
      <MovieGrid />
    </div>
  );
};

export default Home;