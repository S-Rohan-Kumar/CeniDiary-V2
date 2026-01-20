import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import axios from "axios";
import CollectionModel from "../components/CollectionModel.jsx";

export default function MovieDetails() {
  const { mediaType, id } = useParams();
  const navigate = useNavigate();
  const {
    user,
    setLocalUser,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    Skip: 0,
    Timepass: 0,
    "Go for it": 0,
    Perfection: 0,
  });
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [internalMovieId, setInternalMovieId] = useState(null);

  const [sentiment, setSentiment] = useState("Perfection");
  const [comment, setComment] = useState("");
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [showModal, setShowModal] = useState({
    show: false,
    type: "",
    message: "",
    onConfirm: null,
  });

  const isWatched =
    !authLoading &&
    user?.watchHistory?.some((item) =>
      typeof item === "object"
        ? item.tmdbId === Number(id)
        : item === Number(id),
    );

  const hasAlreadyReviewed = reviews.some(
    (rev) => rev.owner?._id === user?._id || rev.owner === user?._id,
  );

  const API_KEY = import.meta.env.VITE_TMDB_KEY;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const movieRes = await axios.get(
          `https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${API_KEY}&append_to_response=credits,watch/providers`,
        );

        const data = movieRes.data;
        const normalized = {
          ...data,
          title: data.title || data.name, 
          release_date: data.release_date || data.first_air_date,
          runtime:
            data.runtime ||
            (data.episode_run_time ? data.episode_run_time[0] : 0),
        };
        setMovie(normalized);

        const [reviewRes, statsRes] = await Promise.all([
          axios.get(`/api/v1/reviews/m/${id}?mediaType=${mediaType}`),
          axios.get(`/api/v1/reviews/stats/${id}?mediaType=${mediaType}`),
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
  }, [id, mediaType, API_KEY]);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const handleToggleWatched = async () => {
    if (!isAuthenticated) return navigate("/login");

    if (isWatched) {
      setShowModal({
        show: true,
        type: "warning",
        message:
          "Unmarking this film as watched will permanently delete your Diary Entry. Proceed?",
        onConfirm: async () => {
          try {
            const response = await axios.post("/api/v1/users/watch-history", {
              tmdbId: id,
            });
            setLocalUser({ watchHistory: response.data.data });
            window.location.reload();
          } catch (err) {
            console.error(err);
          }
        },
      });
    } else {
      try {
        const response = await axios.post("/api/v1/users/watch-history", {
          tmdbId: id,
        });
        setLocalUser({ watchHistory: response.data.data });
        window.location.reload();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handlePostReview = async () => {
    if (!isWatched)
      return setShowModal({
        show: true,
        type: "error",
        message: "You must watch the film before recording a journey.",
      });
    if (!comment.trim())
      return setShowModal({
        show: true,
        type: "error",
        message: "Please log your thoughts in the diary first.",
      });

    try {
      const res = await axios.post("/api/v1/reviews/add", {
        mediaType,
        movieId: id,
        comment,
        sentiment,
      });
      console.log(res.data);
      if (res.status === 201) window.location.reload();
    } catch (err) {
      setShowModal({
        show: true,
        type: "error",
        message: err.response?.data?.message || "Entry failed",
      });
    }
  };

  if (loading || authLoading)
    return (
      <div className="h-screen bg-black flex items-center justify-center text-red-600 font-black animate-pulse uppercase tracking-[0.5em] text-sm">
        Syncing CeniDiary...
      </div>
    );

  if (!movie)
    return (
      <div className="h-screen bg-black text-zinc-800 flex items-center justify-center font-black italic text-lg uppercase">
        Content Not Found
      </div>
    );

  const director = movie.credits?.crew?.find(
    (p) => p.job === "Director" || p.job === "Executive Producer",
  )?.name;
  const writers = movie.credits?.crew
    ?.filter((p) => p.job === "Writer" || p.job === "Screenplay")
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600/30 pb-20 relative overflow-x-hidden">
      {/* --- TOAST NOTIFICATION --- */}
      {toast.show && (
        <div className="fixed top-8 right-8 z-[150] flex items-center gap-2 bg-[#121212] border border-white/10 px-4 py-3 rounded-lg shadow-2xl animate-in slide-in-from-right duration-300">
          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="4"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <p className="text-white font-bold text-xs tracking-tight">
            {toast.message}
          </p>
        </div>
      )}

      {/* --- CUSTOM MODAL SYSTEM --- */}
      {showModal.show && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-red-600/30 p-8 rounded-3xl max-w-md w-full shadow-2xl shadow-red-600/20 transform animate-in fade-in zoom-in duration-300">
            <h2
              className={`text-lg font-black italic mb-3 uppercase ${showModal.type === "error" || showModal.type === "warning" ? "text-red-600" : "text-purple-500"}`}
            >
              {showModal.type} notification
            </h2>
            <p className="text-zinc-300 text-sm mb-8 leading-relaxed font-medium italic opacity-80">
              "{showModal.message}"
            </p>
            <div className="flex gap-3">
              {showModal.onConfirm ? (
                <>
                  <button
                    onClick={() => {
                      showModal.onConfirm();
                      setShowModal({ ...showModal, show: false });
                    }}
                    className="flex-1 bg-red-600 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest text-white transition-all hover:bg-red-700 active:scale-95"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowModal({ ...showModal, show: false })}
                    className="flex-1 bg-zinc-800 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest text-zinc-400"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowModal({ ...showModal, show: false })}
                  className="w-full bg-white text-black py-3 rounded-xl font-black text-[9px] uppercase tracking-widest"
                >
                  Understood
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isCollectionModalOpen && (
        <CollectionModel
          movieDbId={id}
          mediaType={mediaType}
          onClose={() => setIsCollectionModalOpen(false)}
          triggerToast={showToast}
        />
      )}

      {/* --- HERO IDENTITY --- */}
      <div className="relative h-[70vh] w-full overflow-hidden text-left">
        <img
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
          className="w-full h-full object-cover opacity-40 scale-105 transition-transform duration-1000"
          alt="hero"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

        <div className="absolute bottom-10 left-8 right-8 flex flex-col md:flex-row items-end justify-between gap-8 z-10">
          <div className="flex gap-6 items-end">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              className="w-36 rounded-2xl shadow-2xl border border-white/5 hidden md:block transform hover:-rotate-2 transition-all duration-500"
              alt="poster"
            />
            <div className="space-y-3">
              <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="bg-red-600/20 text-red-500 px-2 py-0.5 rounded-full text-[9px] border border-red-600/30 uppercase">
                  {mediaType}
                </span>
                {movie.release_date?.split("-")[0]} • {movie.runtime}m
              </p>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic leading-[0.85] drop-shadow-2xl">
                {movie.title}
              </h1>
              <div className="flex gap-8 pt-6">
                <MetaItem label="Directed By" value={director} />
                <MetaItem label="Genre" value={movie.genres?.[0]?.name} />
                <MetaItem
                  label="Rating"
                  value={`★ ${movie.vote_average.toFixed(1)}`}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-64">
            <button
              onClick={handleToggleWatched}
              className={`group w-full py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${isWatched ? "bg-green-600 text-white shadow-xl shadow-green-600/20 hover:bg-red-600 hover:shadow-red-600/20" : "bg-purple-600 text-white shadow-xl shadow-purple-600/20"}`}
            >
              <span className={isWatched ? "group-hover:hidden" : ""}>
                {isWatched ? "✓ Watched" : " Mark as Watched"}
              </span>
              {isWatched && (
                <span className="hidden group-hover:inline">✗ Unmark</span>
              )}
            </button>
            <button
              onClick={() => setIsCollectionModalOpen(true)}
              className="w-full py-3 rounded-full font-black text-[10px] uppercase tracking-widest bg-zinc-900 border border-white/10 text-white hover:border-red-600/40 transition-all flex items-center justify-center gap-2"
            >
              🔖 Add to Collection
            </button>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="max-w-[1600px] mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-12 gap-16 text-left">
        <div className="lg:col-span-8 space-y-20">
          <section>
            <h3 className="text-red-600 font-black uppercase tracking-[0.4em] text-[9px] mb-6">
              Synopsis
            </h3>
            <p className="text-xl md:text-2xl text-zinc-300 leading-tight font-medium italic opacity-95">
              "{movie.overview}"
            </p>
          </section>

          <section>
            <h3 className="text-red-600 font-black uppercase tracking-[0.4em] text-[9px] mb-10">
              Top Cast
            </h3>
            <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar">
              {movie.credits?.cast?.slice(0, 15).map((actor) => (
                <CastCard key={actor.id} actor={actor} />
              ))}
            </div>
          </section>

          <CeniMeter stats={stats} totalVotes={totalVotes} />

          {/* --- DIARY ENTRY GATEKEEPER --- */}
          {!hasAlreadyReviewed ? (
            <section className="bg-zinc-900/40 p-10 rounded-3xl border border-white/5 space-y-8 shadow-2xl relative overflow-hidden group">
              <h3 className="text-red-600 font-black uppercase tracking-[0.4em] text-[9px]">
                Log your Journey
              </h3>
              <div className="flex items-center justify-between flex-wrap gap-5">
                <UserSignature user={user} />
                <div className="flex bg-black/60 p-1 rounded-xl border border-white/5 shadow-inner">
                  {["Skip", "Timepass", "Go for it", "Perfection"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSentiment(s)}
                      className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${sentiment === s ? "bg-red-600 text-white shadow-xl shadow-red-600/20" : "text-zinc-500 hover:text-white"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                placeholder="Record your cinematic thoughts..."
                className="w-full bg-transparent border-b border-white/10 py-5 outline-none text-zinc-300 h-24 resize-none text-base font-medium italic"
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  onClick={handlePostReview}
                  className="bg-white text-black px-10 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-lg hover:bg-red-600 hover:text-white transition-all active:scale-95"
                >
                  Post Diary Entry
                </button>
              </div>
            </section>
          ) : (
            <div className="bg-zinc-900/20 p-8 rounded-2xl border border-green-600/20 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-600/20 text-green-500 flex items-center justify-center text-sm">
                  ✓
                </div>
                <p className="text-zinc-400 font-bold italic text-xs">
                  You have recorded your journey for this film.
                </p>
              </div>
              <button className="text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-red-600 transition-colors">
                Edit Entry
              </button>
            </div>
          )}

          {/* --- REVIEWS FEED --- */}
          <section className="space-y-10 pt-8 border-t border-white/5">
            <h3 className="text-zinc-500 font-black uppercase tracking-[0.4em] text-[9px]">
              Recent Entries
            </h3>
            {reviews.length > 0 ? (
              reviews.map((rev) => <ReviewCard key={rev._id} rev={rev} />)
            ) : (
              <p className="text-zinc-800 font-black text-xl uppercase italic tracking-tighter opacity-20 text-center py-16">
                The Diary is currently empty.
              </p>
            )}
          </section>
        </div>

        {/* --- SIDEBAR --- */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-zinc-900/40 p-8 rounded-2xl border border-white/5 space-y-8 shadow-2xl">
            <h3 className="font-black text-[9px] uppercase tracking-[0.4em] text-zinc-500">
              Key Production
            </h3>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">
                  Director
                </p>
                <p className="font-bold text-base text-white">{director}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">
                  Writing Team
                </p>
                <p className="font-bold text-xs text-zinc-300 leading-relaxed">
                  {writers?.map((w) => w.name).join(", ")}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">
                  Status
                </p>
                <p className="font-bold text-xs text-zinc-300">
                  {movie.status} ({movie.release_date})
                </p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/40 p-8 rounded-2xl border border-white/5 shadow-2xl">
            <h3 className="font-black text-[9px] uppercase tracking-[0.4em] mb-6 text-zinc-500">
              Theater & Streaming
            </h3>
            <div className="space-y-4">
              {movie["watch/providers"]?.results?.IN?.flatrate ? (
                movie["watch/providers"].results.IN.flatrate.map((p) => (
                  <div
                    key={p.provider_id}
                    className="flex items-center gap-3 bg-black/60 p-3 rounded-xl border border-white/5 hover:border-red-600/40 transition-all cursor-pointer"
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                      className="w-10 h-10 rounded-lg shadow-lg shadow-black"
                      alt={p.provider_name}
                    />
                    <div>
                      <p className="text-[10px] font-black uppercase text-white tracking-widest">
                        {p.provider_name}
                      </p>
                      <p className="text-[8px] font-bold text-zinc-600 uppercase">
                        Subscription
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest italic text-center py-3">
                  Limited to Theaters
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---
const MetaItem = ({ label, value }) => (
  <div>
    <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-0.5">
      {label}
    </p>
    <p className="text-base font-black text-white italic">{value || "N/A"}</p>
  </div>
);

const UserSignature = ({ user }) => (
  <div className="flex items-center gap-3">
    {user?.avatar ? (
      <img
        src={user.avatar}
        className="w-10 h-10 rounded-full border-2 border-red-600/40 object-cover shadow-lg"
        alt="avatar"
      />
    ) : (
      <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-xs uppercase border border-red-600/30 shadow-red-600/20 shadow-xl">
        {user?.username?.substring(0, 2) || "G"}
      </div>
    )}
    <p className="font-black text-xs text-zinc-200 tracking-tight italic">
      @{user?.username || "guest"}
    </p>
  </div>
);

const CastCard = ({ actor }) => (
  <div className="flex-shrink-0 w-28 text-center group cursor-pointer">
    <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-zinc-900 group-hover:border-red-600 shadow-2xl mb-4 transition-all duration-700">
      <img
        src={
          actor.profile_path
            ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
            : "https://ui-avatars.com/api/?name=" + actor.name
        }
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
        alt={actor.name}
      />
    </div>
    <p className="font-black text-xs truncate px-2">{actor.name}</p>
    <p className="text-[9px] text-zinc-600 font-black uppercase tracking-tighter truncate mt-0.5 opacity-60">
      {actor.character}
    </p>
  </div>
);

const CeniMeter = ({ stats, totalVotes }) => {
  const radius = 80;
  const circumference = Math.PI * radius;
  const getOffset = (p) => circumference - (p / 100) * circumference;
  const pP = (stats.Perfection / totalVotes) * 100 || 0;
  const gP = (stats["Go for it"] / totalVotes) * 100 || 0;
  const tP = (stats.Timepass / totalVotes) * 100 || 0;
  const sP = (stats.Skip / totalVotes) * 100 || 0;
  return (
    <div className="bg-zinc-900/20 p-12 rounded-3xl border border-white/5 flex flex-col items-center shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
      <h3 className="text-2xl font-black italic mb-12 self-start tracking-tighter uppercase">
        Ceni<span className="text-red-600">Meter</span>
      </h3>
      <div className="relative w-80 h-40 flex justify-center overflow-hidden">
        <svg width="300" height="160" viewBox="0 0 200 110">
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#18181b"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#a855f7"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={getOffset(pP + gP + tP + sP)}
          />
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#22c55e"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={getOffset(gP + tP + sP)}
          />
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#eab308"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={getOffset(tP + sP)}
          />
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#ef4444"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={getOffset(sP)}
          />
        </svg>
        <div className="absolute bottom-3 text-center">
          <p className="text-5xl font-black italic tracking-tighter">
            {Math.round(pP)}%
          </p>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mt-2">
            {totalVotes} REAL VOTES
          </p>
        </div>
      </div>
      <div className="flex gap-8 mt-10 bg-black/40 px-8 py-5 rounded-2xl border border-white/5">
        <Indicator color="bg-red-500" label="Skip" val={stats.Skip} />
        <Indicator
          color="bg-yellow-500"
          label="Timepass"
          val={stats.Timepass}
        />
        <Indicator
          color="bg-green-500"
          label="Go for it"
          val={stats["Go for it"]}
        />
        <Indicator
          color="bg-purple-500"
          label="Perfection"
          val={stats.Perfection}
        />
      </div>
    </div>
  );
};

const Indicator = ({ color, label, val }) => (
  <div className="flex items-center gap-2.5 text-[10px] font-black uppercase">
    <span
      className={`w-2 h-2 rounded-full ${color} shadow-lg shadow-black`}
    ></span>
    <span className="text-zinc-600 tracking-widest">{label}</span>
    <span className="text-white">{val}</span>
  </div>
);

const ReviewCard = ({ rev }) => {
  const getBadgeStyles = (sent) => {
    switch (sent) {
      case "Perfection":
        return "bg-purple-600/20 text-purple-400 border-purple-600/40 shadow-purple-600/10 shadow-lg";
      case "Go for it":
        return "bg-green-600/20 text-green-400 border-green-600/40 shadow-green-600/10 shadow-lg";
      case "Timepass":
        return "bg-yellow-600/20 text-yellow-400 border-yellow-600/40 shadow-yellow-600/10 shadow-lg";
      default:
        return "bg-red-600/20 text-red-400 border-red-600/40 shadow-red-600/10 shadow-lg";
    }
  };

  return (
    <div className="bg-zinc-900/20 p-8 rounded-2xl border border-white/5 hover:border-red-600/20 transition-all duration-500 shadow-xl group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-red-600/20 group-hover:bg-red-600 transition-colors duration-500"></div>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <img
            src={
              rev.owner?.avatar ||
              `https://ui-avatars.com/api/?name=${rev.owner?.username}`
            }
            className="w-8 h-8 rounded-full border border-white/10 object-cover"
            alt="pfp"
          />
          <span className="font-black text-xs text-white italic">
            @{rev.owner?.username}
          </span>
        </div>
        <span
          className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${getBadgeStyles(rev.sentiment)}`}
        >
          {rev.sentiment}
        </span>
      </div>
      <p className="text-zinc-300 leading-relaxed italic text-lg opacity-90 font-medium">
        "{rev.comment}"
      </p>
    </div>
  );
};