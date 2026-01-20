import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function CollectionView() {
  const { listId } = useParams();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/v1/lists/l/${listId}`);
        setList(res.data.data);
      } catch (err) {
        console.error("Failed to load collection", err);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [listId]);

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-red-600 font-black italic text-sm animate-pulse uppercase tracking-widest">Accessing Shelf...</div>;
  if (!list) return <div className="h-screen bg-black flex items-center justify-center text-zinc-800 font-black italic text-lg uppercase">Shelf Not Found</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 selection:bg-red-600/30">
      <div className="max-w-[1100px] mx-auto">
        
        <div className="mb-10 border-b border-white/5 pb-8 text-left">
          <Link to={`/u/${list.owner?.username}`} className="text-[9px] font-black text-red-600 uppercase tracking-[0.3em] mb-2 block hover:underline italic">
            ← Back to @{list.owner?.username}'s Vault
          </Link>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-2">{list.title}</h1>
          <p className="text-zinc-500 font-medium italic text-xs max-w-2xl leading-relaxed">"{list.descriptoin || "A curated cinematic selection."}"</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {list.movies?.map((movie) => (
            <div key={movie._id} className="group relative aspect-[2/3] bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 hover:border-red-600/40 transition-all duration-500 shadow-lg">
             
              <Link to={`/detail/${movie.mediaType || 'movie'}/${movie.tmdbId}`}>
                <img 
                  src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                  alt="poster" 
                />
              </Link>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4 pointer-events-none">
                <p className="font-black italic text-[8px] uppercase tracking-widest truncate text-white">{movie.title}</p>
                <p className="text-[7px] text-zinc-400 font-bold uppercase mt-1">{movie.releaseDate?.split("-")[0]}</p>
              </div>
            </div>
          ))}
        </div>

        {list.movies?.length === 0 && (
          <div className="py-20 text-center opacity-10 font-black italic uppercase text-xl tracking-tighter">
            This collection is currently vacant
          </div>
        )}
      </div>
    </div>
  );
}