import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import axios from "axios";
import CollectionModel from "../components/CollectionModel.jsx";

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setLocalUser, isAuthenticated, loading: authLoading } = useAuth();
  
  // --- DATA STATES ---
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ Skip: 0, Timepass: 0, "Go for it": 0, Perfection: 0 });
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [internalMovieId, setInternalMovieId] = useState(null);
  
  // --- UI & FORM STATES ---
  const [sentiment, setSentiment] = useState("Perfection");
  const [comment, setComment] = useState("");
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [showModal, setShowModal] = useState({ show: false, type: '', message: '', onConfirm: null });

  // Persistence Logic: Checks if movie is in user's watch history
  const isWatched = !authLoading && user?.watchHistory?.some(item => 
    typeof item === 'object' ? item.tmdbId === Number(id) : item === Number(id)
  );

  // Gatekeeper: Prevents multiple reviews for the same film
  const hasAlreadyReviewed = reviews.some(rev => 
    (rev.owner?._id === user?._id) || (rev.owner === user?._id)
  );

  const API_KEY = import.meta.env.VITE_TMDB_KEY;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Visuals from TMDB
        const movieRes = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&append_to_response=credits,watch/providers`
        );
        setMovie(movieRes.data);

        // 2. Fetch Genuine Stats & Reviews from Backend
        const [reviewRes, statsRes] = await Promise.all([
          axios.get(`/api/v1/reviews/m/${id}`),
          axios.get(`/api/v1/reviews/stats/${id}`)
        ]);

        setReviews(reviewRes.data.data);
        setStats(statsRes.data.data.counts);
        setTotalVotes(statsRes.data.data.totalVotes);
        setInternalMovieId(statsRes.data.data.movieObjectId);
      } catch (error) {
        console.error("Data Sync Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id, API_KEY]);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const handleToggleWatched = async () => {
    if (!isAuthenticated) return navigate("/login");
    
    if (isWatched) {
      // Custom Modal for unwatch confirmation to protect review integrity
      setShowModal({
        show: true, 
        type: 'warning', 
        message: "Unmarking this film as watched will permanently delete your Diary Entry. Proceed?",
        onConfirm: async () => {
          try {
            const response = await axios.post("/api/v1/users/watch-history", { tmdbId: id });
            setLocalUser({ watchHistory: response.data.data }); 
            window.location.reload();
          } catch (err) { console.error(err); }
        }
      });
    } else {
      try {
        const response = await axios.post("/api/v1/users/watch-history", { tmdbId: id });
        setLocalUser({ watchHistory: response.data.data }); 
        window.location.reload();
      } catch (err) { console.error(err); }
    }
  };

  const handlePostReview = async () => {
    if (!isWatched) return setShowModal({ show: true, type: 'error', message: "You must watch the film before recording a journey." });
    if (!comment.trim()) return setShowModal({ show: true, type: 'error', message: "Please log your thoughts in the diary first." });

    try {
      const res = await axios.post("/api/v1/reviews/add", { movieId: id, comment, sentiment });
      if (res.status === 201) window.location.reload(); 
    } catch (err) { 
      setShowModal({ show: true, type: 'error', message: err.response?.data?.message || "Entry failed" });
    }
  };

  if (loading || authLoading) return (
    <div className="h-screen bg-black flex items-center justify-center text-red-600 font-black animate-pulse uppercase tracking-[0.5em]">
      Syncing CeniDiary...
    </div>
  );

  const director = movie.credits?.crew?.find(p => p.job === "Director")?.name;
  const writers = movie.credits?.crew?.filter(p => p.job === "Writer" || p.job === "Screenplay").slice(0, 3);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600/30 pb-20 relative overflow-x-hidden">
      
      {/* --- TOAST NOTIFICATION (Top Right) --- */}
      {toast.show && (
        <div className="fixed top-8 right-8 z-[150] flex items-center gap-3 bg-[#121212] border border-white/10 px-6 py-4 rounded-xl shadow-2xl animate-in slide-in-from-right duration-300">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <p className="text-white font-bold text-sm tracking-tight">{toast.message}</p>
        </div>
      )}

      {/* --- CUSTOM MODAL SYSTEM --- */}
      {showModal.show && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-red-600/30 p-10 rounded-[3rem] max-w-md w-full shadow-2xl shadow-red-600/20 transform animate-in fade-in zoom-in duration-300">
            <h2 className={`text-xl font-black italic mb-4 uppercase ${showModal.type === 'error' || showModal.type === 'warning' ? 'text-red-600' : 'text-purple-500'}`}>
              {showModal.type} notification
            </h2>
            <p className="text-zinc-300 mb-10 leading-relaxed font-medium italic opacity-80">"{showModal.message}"</p>
            <div className="flex gap-4">
              {showModal.onConfirm ? (
                <>
                  <button onClick={() => { showModal.onConfirm(); setShowModal({ ...showModal, show: false }); }} className="flex-1 bg-red-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white transition-all hover:bg-red-700 active:scale-95">Confirm</button>
                  <button onClick={() => setShowModal({ ...showModal, show: false })} className="flex-1 bg-zinc-800 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-zinc-400">Cancel</button>
                </>
              ) : (
                <button onClick={() => setShowModal({ ...showModal, show: false })} className="w-full bg-white text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Understood</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- COLLECTION MODAL --- */}
      {isCollectionModalOpen && (
        <CollectionModel 
          movieDbId={id} 
          onClose={() => setIsCollectionModalOpen(false)} 
          triggerToast={showToast}
        />
      )}

      {/* --- HERO IDENTITY --- */}
      <div className="relative h-[75vh] w-full overflow-hidden">
        <img src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} className="w-full h-full object-cover opacity-40 scale-105 transition-transform duration-1000" alt="hero" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        
        <div className="absolute bottom-12 left-10 right-10 flex flex-col md:flex-row items-end justify-between gap-10 z-10">
          <div className="flex gap-8 items-end">
            <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} className="w-48 rounded-[2.5rem] shadow-2xl border border-white/5 hidden md:block transform hover:-rotate-2 transition-all duration-500" alt="poster" />
            <div className="space-y-4">
              <p className="text-zinc-500 font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-3">
                <span className="bg-red-600/20 text-red-500 px-3 py-1 rounded-full text-[10px] border border-red-600/30">{movie.status}</span>
                {movie.release_date?.split("-")[0]} • {Math.floor(movie.runtime/60)}h {movie.runtime % 60}m
              </p>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic leading-[0.85] drop-shadow-2xl">{movie.title}</h1>
              <div className="flex gap-12 pt-8">
                <MetaItem label="Directed By" value={director} />
                <MetaItem label="Genre" value={movie.genres?.[0]?.name} />
                <MetaItem label="Rating" value={`★ ${movie.vote_average.toFixed(1)}`} />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 w-full md:w-80">
            <button onClick={handleToggleWatched} className={`w-full py-5 rounded-full font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 ${isWatched ? "bg-green-600 text-white shadow-xl shadow-green-600/20" : "bg-purple-600 text-white shadow-xl shadow-purple-600/20"}`}>
              {isWatched ? "✓ Watched" : " Mark as Watched"}
            </button>
            <button 
              onClick={() => setIsCollectionModalOpen(true)}
              className="w-full py-5 rounded-full font-black text-xs uppercase tracking-widest bg-zinc-900 border border-white/10 text-white hover:border-red-600/40 transition-all flex items-center justify-center gap-3"
            >
              🔖 Add to Collection
            </button>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="max-w-[1600px] mx-auto px-10 py-24 grid grid-cols-1 lg:grid-cols-12 gap-20">
        <div className="lg:col-span-8 space-y-24">
          <section>
            <h3 className="text-red-600 font-black uppercase tracking-[0.4em] text-[10px] mb-8">Synopsis</h3>
            <p className="text-2xl md:text-3xl text-zinc-300 leading-tight font-medium italic opacity-95">"{movie.overview}"</p>
          </section>

          <section>
            <h3 className="text-red-600 font-black uppercase tracking-[0.4em] text-[10px] mb-12">Top Cast</h3>
            <div className="flex gap-8 overflow-x-auto pb-10 no-scrollbar">
              {movie.credits?.cast?.slice(0, 15).map(actor => (
                <CastCard key={actor.id} actor={actor} />
              ))}
            </div>
          </section>

          <CeniMeter stats={stats} totalVotes={totalVotes} />

          {/* --- DIARY ENTRY GATEKEEPER --- */}
          {!hasAlreadyReviewed ? (
            <section className="bg-zinc-900/40 p-12 rounded-[3.5rem] border border-white/5 space-y-10 shadow-2xl relative overflow-hidden group">
              <h3 className="text-red-600 font-black uppercase tracking-[0.4em] text-[10px]">Log your Journey</h3>
              <div className="flex items-center justify-between flex-wrap gap-6">
                <UserSignature user={user} />
                <div className="flex bg-black/60 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                  {["Skip", "Timepass", "Go for it", "Perfection"].map(s => (
                    <button key={s} onClick={() => setSentiment(s)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${sentiment === s ? "bg-red-600 text-white shadow-xl shadow-red-600/20" : "text-zinc-500 hover:text-white"}`}>{s}</button>
                  ))}
                </div>
              </div>
              <textarea placeholder="Record your cinematic thoughts..." className="w-full bg-transparent border-b border-white/10 py-6 outline-none text-zinc-300 h-28 resize-none text-lg font-medium italic" onChange={(e) => setComment(e.target.value)} />
              <div className="flex justify-end"><button onClick={handlePostReview} className="bg-white text-black px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-red-600 hover:text-white transition-all active:scale-95">Post Diary Entry</button></div>
            </section>
          ) : (
            <div className="bg-zinc-900/20 p-10 rounded-[3rem] border border-green-600/20 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-green-600/20 text-green-500 flex items-center justify-center">✓</div>
                <p className="text-zinc-400 font-bold italic text-sm">You have recorded your journey for this film.</p>
              </div>
              <button className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-red-600 transition-colors">Edit Entry</button>
            </div>
          )}

          {/* --- REVIEWS FEED --- */}
          <section className="space-y-12 pt-10 border-t border-white/5">
            <h3 className="text-zinc-500 font-black uppercase tracking-[0.4em] text-[10px]">Recent Entries</h3>
            {reviews.length > 0 ? reviews.map(rev => (
              <ReviewCard key={rev._id} rev={rev} />
            )) : <p className="text-zinc-800 font-black text-2xl uppercase italic tracking-tighter opacity-20 text-center py-20">The Diary is currently empty.</p>}
          </section>
        </div>

        {/* --- SIDEBAR --- */}
        <div className="lg:col-span-4 space-y-12">
          <div className="bg-zinc-900/40 p-10 rounded-[2.5rem] border border-white/5 space-y-10 shadow-2xl">
            <h3 className="font-black text-[10px] uppercase tracking-[0.4em] text-zinc-500">Key Production</h3>
            <div className="space-y-8">
              <div className="space-y-2"><p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Director</p><p className="font-bold text-lg text-white">{director}</p></div>
              <div className="space-y-2"><p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Writing Team</p><p className="font-bold text-sm text-zinc-300 leading-relaxed">{writers?.map(w => w.name).join(", ")}</p></div>
              <div className="space-y-2"><p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Status</p><p className="font-bold text-sm text-zinc-300">{movie.status} ({movie.release_date})</p></div>
            </div>
          </div>

          <div className="bg-zinc-900/40 p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
             <h3 className="font-black text-[10px] uppercase tracking-[0.4em] mb-8 text-zinc-500">Theater & Streaming</h3>
             <div className="space-y-5">
               {movie['watch/providers']?.results?.IN?.flatrate ? movie['watch/providers'].results.IN.flatrate.map(p => (
                  <div key={p.provider_id} className="flex items-center gap-4 bg-black/60 p-4 rounded-2xl border border-white/5 hover:border-red-600/40 transition-all cursor-pointer">
                     <img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} className="w-12 h-12 rounded-xl shadow-lg shadow-black" alt={p.provider_name} />
                     <div><p className="text-[11px] font-black uppercase text-white tracking-widest">{p.provider_name}</p><p className="text-[9px] font-bold text-zinc-600 uppercase">Subscription</p></div>
                  </div>
               )) : <p className="text-[10px] text-zinc-700 font-black uppercase tracking-widest italic text-center py-4">Limited to Theaters</p>}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---
const MetaItem = ({ label, value }) => (<div><p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p><p className="text-lg font-black text-white italic">{value || "N/A"}</p></div>);

const UserSignature = ({ user }) => (
  <div className="flex items-center gap-4">
    {user?.avatar ? (
      <img src={user.avatar} className="w-12 h-12 rounded-full border-2 border-red-600/40 object-cover shadow-lg" alt="avatar" />
    ) : (
      <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-sm uppercase border border-red-600/30 shadow-red-600/20 shadow-xl">
        {user?.username?.substring(0, 2) || "G"}
      </div>
    )}
    <p className="font-black text-sm text-zinc-200 tracking-tight italic">@{user?.username || "guest"}</p>
  </div>
);

const CastCard = ({ actor }) => (
  <div className="flex-shrink-0 w-36 text-center group cursor-pointer">
    <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-zinc-900 group-hover:border-red-600 shadow-2xl mb-5 transition-all duration-700">
      <img src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : "https://via.placeholder.com/185x185"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={actor.name} />
    </div>
    <p className="font-black text-sm truncate px-2">{actor.name}</p>
    <p className="text-[10px] text-zinc-600 font-black uppercase tracking-tighter truncate mt-1 opacity-60">{actor.character}</p>
  </div>
);

const CeniMeter = ({ stats, totalVotes }) => {
  const radius = 80; const circumference = Math.PI * radius;
  const getOffset = (p) => circumference - (p / 100) * circumference;
  const pP = (stats.Perfection / totalVotes) * 100 || 0;
  const gP = (stats["Go for it"] / totalVotes) * 100 || 0;
  const tP = (stats.Timepass / totalVotes) * 100 || 0;
  const sP = (stats.Skip / totalVotes) * 100 || 0;
  return (
    <div className="bg-zinc-900/20 p-16 rounded-[4rem] border border-white/5 flex flex-col items-center shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
      <h3 className="text-3xl font-black italic mb-16 self-start tracking-tighter uppercase">Ceni<span className="text-red-600">Meter</span></h3>
      <div className="relative w-96 h-48 flex justify-center overflow-hidden">
        <svg width="340" height="180" viewBox="0 0 200 110">
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#18181b" strokeWidth="18" strokeLinecap="round" />
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#a855f7" strokeWidth="18" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={getOffset(pP + gP + tP + sP)} />
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#22c55e" strokeWidth="18" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={getOffset(gP + tP + sP)} />
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#eab308" strokeWidth="18" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={getOffset(tP + sP)} />
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#ef4444" strokeWidth="18" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={getOffset(sP)} />
        </svg>
        <div className="absolute bottom-4 text-center">
          <p className="text-7xl font-black italic tracking-tighter">{Math.round(pP)}%</p>
          <p className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] mt-3">{totalVotes} REAL VOTES</p>
        </div>
      </div>
      <div className="flex gap-10 mt-12 bg-black/40 px-10 py-6 rounded-3xl border border-white/5">
         <Indicator color="bg-red-500" label="Skip" val={stats.Skip} /><Indicator color="bg-yellow-500" label="Timepass" val={stats.Timepass} /><Indicator color="bg-green-500" label="Go for it" val={stats["Go for it"]} /><Indicator color="bg-purple-500" label="Perfection" val={stats.Perfection} />
      </div>
    </div>
  );
};

const Indicator = ({ color, label, val }) => (<div className="flex items-center gap-3 text-[11px] font-black uppercase"><span className={`w-2.5 h-2.5 rounded-full ${color} shadow-lg shadow-black`}></span><span className="text-zinc-500 tracking-widest">{label}</span><span className="text-white">{val}</span></div>);

const ReviewCard = ({ rev }) => {
  const getBadgeStyles = (sent) => {
    switch (sent) {
      case 'Perfection': return 'bg-purple-600/20 text-purple-400 border-purple-600/40 shadow-purple-600/10 shadow-lg';
      case 'Go for it': return 'bg-green-600/20 text-green-400 border-green-600/40 shadow-green-600/10 shadow-lg';
      case 'Timepass': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/40 shadow-yellow-600/10 shadow-lg';
      default: return 'bg-red-600/20 text-red-400 border-red-600/40 shadow-red-600/10 shadow-lg';
    }
  };

  return (
    <div className="bg-zinc-900/20 p-10 rounded-[2.5rem] border border-white/5 hover:border-red-600/20 transition-all duration-500 shadow-xl group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-red-600/20 group-hover:bg-red-600 transition-colors duration-500"></div>
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          {rev.owner?.avatar ? (
            <img src={rev.owner?.avatar} className="w-10 h-10 rounded-full border border-white/10 object-cover" alt="pfp" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-black text-[10px] text-zinc-500 border border-white/5 uppercase">
              {rev.owner?.username?.substring(0, 2)}
            </div>
          )}
          <span className="font-black text-sm text-white italic">@{rev.owner?.username}</span>
        </div>
        <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${getBadgeStyles(rev.sentiment)}`}>
          {rev.sentiment}
        </span>
      </div>
      <p className="text-zinc-300 leading-relaxed italic text-xl opacity-90 font-medium">"{rev.comment}"</p>
    </div>
  );
};