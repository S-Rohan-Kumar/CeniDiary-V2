import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

export default function PublicProfile() {
  const { username } = useParams(); // Get username from URL
  const { user: currentUser } = useAuth();
  
  const [profileUser, setProfileUser] = useState(null);
  const [data, setData] = useState([]); // Reviews or Collections
  const [activeTab, setActiveTab] = useState("Reviews");
  const [activeSentiment, setActiveSentiment] = useState("All");
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const sentiments = useMemo(() => [
    { label: "All", color: "bg-zinc-800", dot: "bg-zinc-500" },
    { label: "Skip", color: "bg-red-600", dot: "bg-red-600" },
    { label: "Timepass", color: "bg-amber-500", dot: "bg-amber-500" },
    { label: "Go For It", color: "bg-emerald-500", dot: "bg-emerald-500" },
    { label: "Perfection", color: "bg-purple-600", dot: "bg-purple-600" },
  ], []);

  // Fetch Public Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/v1/users/u/${username}`);
        setProfileUser(res.data.data.user);
        setIsFollowing(res.data.data.user.isFollowing);
        
        // Tab switching logic for data
        if (activeTab === "Reviews") {
          setData(res.data.data.reviews);
        } else {
          setData(res.data.data.collections);
        }
      } catch (err) { console.error("Profile not found", err); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, [username, activeTab]);

  const handleFollowToggle = async () => {
    if (!currentUser) return alert("Please login to follow");
    try {
      // Hits your router.post("/follow/:targtetUserId")
      await axios.post(`/api/v1/social/follow/${profileUser._id}`);
      setIsFollowing(!isFollowing);
    } catch (err) { console.error("Follow failed", err); }
  };

  const filteredData = useMemo(() => {
    if (activeTab !== "Reviews" || activeSentiment === "All") return data;
    return data.filter(r => r.sentiment?.toLowerCase().replace(/\s/g, "") === activeSentiment.toLowerCase().replace(/\s/g, ""));
  }, [data, activeTab, activeSentiment]);

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-red-600 font-black italic text-3xl animate-pulse uppercase">Entering Diary...</div>;
  if (!profileUser) return <div className="h-screen bg-black flex items-center justify-center text-zinc-600 font-black italic text-3xl uppercase">User Not Found</div>;

  return (
    <div className="min-h-screen bg-black text-white p-12 tracking-tight">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-12 text-left">
        
        {/* --- SIDEBAR: Profile Identity --- */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-[#1A1A1A] p-10 rounded-[3rem] border border-white/5 text-center shadow-2xl relative">
            <div className="w-36 h-36 mx-auto rounded-full bg-[#262626] border-4 border-zinc-900 shadow-2xl overflow-hidden mb-8">
               <img src={profileUser.avatar} className="w-full h-full object-cover" alt="profile" />
            </div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">{profileUser.username}</h1>
            <p className="text-zinc-500 font-bold text-[10px] mt-1 uppercase tracking-widest opacity-60">@{profileUser.username}_2026</p>
            
            <div className="grid grid-cols-2 gap-4 mt-12 text-[10px] font-black uppercase text-zinc-600 tracking-widest italic">
              <div><p className="text-white text-lg font-black">{profileUser.followersCount}</p>Followers</div>
              <div><p className="text-white text-lg font-black">{profileUser.followingCount}</p>Following</div>
            </div>

            {/* ACTION BUTTON: Follow or Edit based on ownership */}
            {currentUser?._id === profileUser._id ? (
              <Link to="/profile" className="block w-full mt-12 py-4 rounded-2xl bg-zinc-800 border border-white/5 font-black text-[10px] uppercase hover:bg-red-600 transition-all text-white italic text-center">Manage My Profile</Link>
            ) : (
              <button 
                onClick={handleFollowToggle}
                className={`w-full mt-12 py-4 rounded-2xl font-black text-[10px] uppercase transition-all tracking-[0.2em] italic border ${isFollowing ? 'bg-transparent border-white/10 text-zinc-500 hover:text-red-500' : 'bg-red-600 text-white shadow-lg shadow-red-600/20 active:scale-95'}`}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 space-y-8">
          <div className="flex bg-[#1A1A1A] p-1.5 rounded-2xl border border-white/5 w-fit">
            {["Reviews", "Collections"].map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); setActiveSentiment("All"); }} className={`px-12 py-3.5 rounded-xl text-xs font-black uppercase transition-all duration-300 ${activeTab === tab ? 'bg-[#262626] text-white italic shadow-xl' : 'text-zinc-500 hover:text-white'}`}>{tab}</button>
            ))}
          </div>

          {activeTab === "Reviews" && (
            <div className="bg-[#1A1A1A] p-6 rounded-[2rem] border border-white/5 flex items-center justify-around">
               {sentiments.slice(1).map(s => (
                 <button key={s.label} onClick={() => setActiveSentiment(s.label === activeSentiment ? "All" : s.label)} className={`flex items-center gap-3 transition-all ${activeSentiment === s.label ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-100'}`}>
                    <div className={`w-3 h-3 rounded-full ${s.dot} shadow-lg`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest italic text-zinc-300">{s.label}</span>
                 </button>
               ))}
            </div>
          )}

          <div className="bg-[#1A1A1A] rounded-[3rem] border border-white/5 min-h-[500px] p-8 shadow-2xl">
             <div className="grid grid-cols-1 gap-6">
               {filteredData.length > 0 ? filteredData.map((item) => (
                 activeTab === "Reviews" ? (
                   <div key={item._id} className="bg-[#262626] p-7 rounded-[2.5rem] border border-white/5 flex gap-8 hover:border-red-600/30 transition-all group">
                      <div className="w-28 h-40 rounded-3xl overflow-hidden shrink-0 shadow-2xl border border-white/5">
                         <img src={`https://image.tmdb.org/t/p/w300${item.movie?.posterPath}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="movie" />
                      </div>
                      <div className="flex-1 py-1">
                         <div className="flex justify-between items-start">
                            <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white">{item.movie?.title}</h4>
                            <span className={`${sentiments.find(s => s.label.toLowerCase().replace(/\s/g, "") === item.sentiment?.toLowerCase().replace(/\s/g, ""))?.color || 'bg-zinc-700'} text-[9px] font-black uppercase px-5 py-2 rounded-full italic tracking-[0.2em] shadow-lg`}>{item.sentiment}</span>
                         </div>
                         <p className="text-zinc-400 text-base mt-6 font-medium italic leading-relaxed max-w-2xl">"{item.comment}"</p>
                      </div>
                   </div>
                 ) : (
                   <div key={item._id} className="group flex items-center justify-between p-8 bg-[#262626] rounded-[2.5rem] border border-white/5">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-zinc-800/20 rounded-3xl flex items-center justify-center border border-white/5"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-40"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg></div>
                         <h4 className="text-xl font-black italic uppercase tracking-tighter text-zinc-200">{item.title}</h4>
                      </div>
                      <Link to={`/collection/${item._id}`} className="px-6 py-2 bg-zinc-800 rounded-xl text-[10px] font-black uppercase italic hover:bg-white hover:text-black transition-all">View Shelf</Link>
                   </div>
                 )
               )) : <div className="flex flex-col items-center justify-center h-[400px] opacity-20 font-black italic uppercase text-2xl tracking-tighter">Nothing here yet</div>}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}