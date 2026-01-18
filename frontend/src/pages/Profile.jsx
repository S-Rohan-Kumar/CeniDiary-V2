import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import axios from "axios";
import EditProfileModal from "../components/EditProfileModal";

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Reviews");
  const [activeSentiment, setActiveSentiment] = useState("All");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // VIBRANT COLOR SCHEME: Strict mapping for dots and card tags
  const sentiments = useMemo(() => [
    { label: "All", color: "bg-zinc-800", dot: "bg-zinc-500" },
    { label: "Skip", color: "bg-red-600", dot: "bg-red-600" },
    { label: "Timepass", color: "bg-amber-500", dot: "bg-amber-500" },
    { label: "Go For It", color: "bg-emerald-500", dot: "bg-emerald-500" },
    { label: "Perfection", color: "bg-purple-600", dot: "bg-purple-600" },
  ], []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      setLoading(true);
      try {
        const endpoint = activeTab === "Reviews" 
          ? `/api/v1/reviews/user/${user._id}` 
          : `/api/v1/lists/`;
        const res = await axios.get(endpoint);
        setData(res.data.data);
      } catch (err) { 
        console.error("Fetch Error:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, [activeTab, user]);

  // LOGIC: Robust filtering that handles potential database casing mismatches
  const filteredData = useMemo(() => {
    if (activeTab !== "Reviews" || activeSentiment === "All") return data;
    return data.filter(review => 
      review.sentiment?.toLowerCase().replace(/\s/g, "") === activeSentiment.toLowerCase().replace(/\s/g, "")
    );
  }, [data, activeTab, activeSentiment]);

  const getCount = (label) => {
    return data.filter(r => r.sentiment?.toLowerCase().replace(/\s/g, "") === label.toLowerCase().replace(/\s/g, "")).length;
  };

  return (
    <div className="min-h-screen bg-black text-white p-12 font-sans tracking-tight">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-12 text-left">
        
        {/* --- SIDEBAR --- */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-[#1A1A1A] p-10 rounded-[3rem] border border-white/5 text-center shadow-2xl relative group">
            <div className="w-36 h-36 mx-auto rounded-full bg-[#262626] border-4 border-zinc-900 shadow-2xl overflow-hidden mb-8 transition-all duration-500 group-hover:border-red-600">
               <img src={user?.avatar} className="w-full h-full object-cover" alt="profile" />
            </div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">{user?.username}</h1>
            <p className="text-zinc-500 font-bold text-xs mt-1 lowercase opacity-60 italic">@{user?.username}_2026</p>
            
            <div className="grid grid-cols-2 gap-4 mt-12 text-[10px] font-black uppercase text-zinc-600 tracking-widest italic">
              <div><p className="text-white text-lg font-black italic">{activeTab === "Reviews" ? data.length : "0"}</p>Reviews</div>
              <div><p className="text-white text-lg font-black italic">{activeTab === "Collections" ? data.length : "0"}</p>Collections</div>
            </div>

            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="w-full mt-12 py-4 rounded-2xl bg-[#262626] border border-white/5 font-black text-[10px] uppercase hover:bg-red-600 transition-all text-zinc-300 tracking-[0.2em] italic"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 space-y-8">
          
          <div className="flex bg-[#1A1A1A] p-1.5 rounded-2xl border border-white/5 w-fit">
            {["Reviews", "Collections"].map(tab => (
              <button 
                key={tab}
                onClick={() => { setActiveTab(tab); setActiveSentiment("All"); }}
                className={`px-12 py-3.5 rounded-xl text-xs font-black uppercase transition-all duration-300 ${activeTab === tab ? 'bg-[#262626] text-white shadow-xl italic' : 'text-zinc-500 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* SENTIMENT BAR */}
          {activeTab === "Reviews" && (
            <div className="bg-[#1A1A1A] p-6 rounded-[2rem] border border-white/5 flex items-center justify-around">
               {sentiments.map(s => (
                 <button 
                   key={s.label}
                   onClick={() => setActiveSentiment(s.label)}
                   className={`flex items-center gap-3 transition-all px-6 py-2 rounded-xl border border-transparent ${activeSentiment === s.label ? `${s.color} text-white shadow-lg scale-105` : 'opacity-40 hover:opacity-100'}`}
                 >
                    {s.label !== "All" && <div className={`w-3 h-3 rounded-full ${s.dot} shadow-lg`}></div>}
                    <span className="text-[10px] font-black uppercase tracking-widest italic text-zinc-300">{s.label}</span>
                    {s.label !== "All" && <span className="text-white font-black italic text-sm ml-1">{getCount(s.label)}</span>}
                 </button>
               ))}
            </div>
          )}

          {/* DATA FEED */}
          <div className="bg-[#1A1A1A] rounded-[3rem] border border-white/5 min-h-[500px] p-8 shadow-2xl relative">
             {loading ? (
               <div className="flex items-center justify-center h-full text-red-600 font-black text-3xl italic animate-pulse">Scanning Vault...</div>
             ) : (
               <div className="grid grid-cols-1 gap-6 self-start">
                 {filteredData.length > 0 ? filteredData.map((item) => (
                   activeTab === "Reviews" ? (
                     <div key={item._id} className="bg-[#262626] p-7 rounded-[2.5rem] border border-white/5 flex gap-8 hover:border-red-600/30 transition-all group">
                        <div className="w-28 h-40 rounded-3xl overflow-hidden shrink-0 shadow-2xl border border-white/5">
                           <img src={`https://image.tmdb.org/t/p/w300${item.movie?.posterPath}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="movie" />
                        </div>
                        <div className="flex-1 py-1">
                           <div className="flex justify-between items-start">
                              <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white">{item.movie?.title}</h4>
                              <span className={`${sentiments.find(s => s.label.toLowerCase().replace(/\s/g, "") === item.sentiment?.toLowerCase().replace(/\s/g, ""))?.color || 'bg-zinc-700'} text-[9px] font-black uppercase px-5 py-2 rounded-full italic tracking-[0.2em] shadow-lg shadow-black/40`}>
                                {item.sentiment}
                              </span>
                           </div>
                           <p className="text-zinc-400 text-base mt-6 font-medium italic leading-relaxed max-w-2xl text-left">"{item.comment}"</p>
                        </div>
                     </div>
                   ) : (
                     <Link to="/my-collections" key={item._id} className="group flex items-center justify-between p-8 bg-[#262626] rounded-[2.5rem] border border-white/5 hover:border-red-600/30 transition-all">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 bg-zinc-800/20 rounded-3xl flex items-center justify-center border border-white/5 group-hover:bg-red-600 transition-all">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-40"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                           </div>
                           <div className="text-left">
                              <h4 className="text-xl font-black italic uppercase tracking-tighter text-zinc-200 group-hover:text-white transition-colors">{item.title}</h4>
                              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1 italic">{item.movies?.length || 0} Films Stored</p>
                           </div>
                        </div>
                     </Link>
                   )
                 )) : (
                   <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-6 opacity-40">
                      <h3 className="text-zinc-300 text-xl font-black italic uppercase tracking-tighter">No {activeSentiment} logged yet</h3>
                   </div>
                 )}
               </div>
             )}
          </div>
        </div>
      </div>

      {isEditModalOpen && <EditProfileModal user={user} onClose={() => setIsEditModalOpen(false)} />}
    </div>
  );
}