import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

export default function PublicProfile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  
  const [profileUser, setProfileUser] = useState(null);
  const [data, setData] = useState([]); 
  const [activeTab, setActiveTab] = useState("Reviews");
  const [activeSentiment, setActiveSentiment] = useState("All");
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const sentiments = useMemo(() => [
    { label: "All", color: "bg-zinc-800", dot: "bg-zinc-500" },
    { label: "Skip", color: "bg-red-600", dot: "bg-red-600" },
    { label: "Timepass", color: "bg-amber-500", dot: "bg-amber-500" },
    { label: "Go For It", color: "bg-emerald-500", dot: "bg-emerald-500" },
    { label: "Perfection", color: "bg-purple-600", dot: "bg-purple-600" },
  ], []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/v1/users/u/${username}`);
        const profileData = res.data.data;
        
        setProfileUser(profileData.user);
        setIsFollowing(profileData.user.isFollowing || false);
        
        setData(activeTab === "Reviews" ? (profileData.reviews || []) : (profileData.collections || []));
      } catch (err) { 
        console.error("Fetch error", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchProfile();
  }, [username, activeTab]);

  const handleFollowToggle = async () => {
    if (!currentUser) return alert("Login required.");
    if (followLoading) return; // Prevent double clicks
    
    try {
      setFollowLoading(true);
      const previousState = isFollowing;
      const previousCount = profileUser.followersCount || 0;
      
      // Optimistic update
      setIsFollowing(!previousState);
      setProfileUser(prev => ({
        ...prev,
        followersCount: !previousState ? previousCount + 1 : Math.max(0, previousCount - 1)
      }));
      
      await axios.post(`/api/v1/social/follow/${profileUser._id}`);
      
    } catch (err) { 
      console.error("Follow failed", err);
      // Revert on error
      setIsFollowing(isFollowing);
      setProfileUser(prev => ({
        ...prev,
        followersCount: profileUser.followersCount
      }));
      alert("Failed to update follow status. Please try again.");
    } finally {
      setFollowLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    if (activeTab !== "Reviews" || activeSentiment === "All") return data;
    return data.filter(r => r.sentiment?.toLowerCase().replace(/\s/g, "") === activeSentiment.toLowerCase().replace(/\s/g, ""));
  }, [data, activeTab, activeSentiment]);

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-red-600 font-black italic text-sm animate-pulse uppercase tracking-[0.4em]">
        Syncing Profile...
      </div>
    );
  }
  
  if (!profileUser) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-zinc-800 font-black italic text-xl uppercase">
        User Not Found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 tracking-tight">
      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-12 text-left items-start">
        
        {/* --- SIDEBAR --- */}
        <div className="lg:w-72 w-full shrink-0">
          <div className="bg-gradient-to-br from-zinc-900/40 to-zinc-900/20 p-8 rounded-3xl border border-white/10 text-center shadow-2xl backdrop-blur-sm relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-600/5 to-transparent pointer-events-none"></div>
            
            <div className="relative">
              <div className="w-28 h-28 mx-auto rounded-full bg-zinc-900 border-2 border-white/10 shadow-2xl overflow-hidden mb-5 ring-4 ring-red-600/10">
                <img src={profileUser.avatar} className="w-full h-full object-cover" alt="pfp" />
              </div>
              
              <h1 className="text-xl font-black italic uppercase tracking-tighter text-white mb-1">
                {profileUser.username}
              </h1>
              <p className="text-zinc-500 font-bold text-[8px] uppercase tracking-widest opacity-60">
                @{profileUser.username}_vault
              </p>
              
              <div className="grid grid-cols-2 gap-3 mt-8 text-[8px] font-black uppercase text-zinc-500 tracking-widest">
                <div className="bg-black/30 py-4 rounded-2xl border border-white/5 hover:border-red-600/20 transition-all cursor-pointer group">
                  <p className="text-white text-2xl font-black leading-none mb-2 group-hover:text-red-600 transition-colors">
                    {profileUser.followersCount || 0}
                  </p>
                  <p className="opacity-60">Followers</p>
                </div>
                <div className="bg-black/30 py-4 rounded-2xl border border-white/5 hover:border-red-600/20 transition-all cursor-pointer group">
                  <p className="text-white text-2xl font-black leading-none mb-2 group-hover:text-red-600 transition-colors">
                    {profileUser.followingCount || 0}
                  </p>
                  <p className="opacity-60">Following</p>
                </div>
              </div>

              {currentUser?._id === profileUser._id ? (
                <Link 
                  to="/profile" 
                  className="block w-full mt-8 py-3.5 rounded-xl bg-zinc-900 border border-white/10 font-black text-[9px] uppercase hover:bg-red-600 hover:border-red-600 transition-all text-white text-center tracking-widest shadow-lg hover:shadow-red-600/20"
                >
                  Manage Profile
                </Link>
              ) : (
                <button 
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`group w-full mt-8 py-3.5 rounded-xl font-black text-[9px] uppercase transition-all tracking-widest border shadow-lg relative overflow-hidden ${
                    isFollowing 
                      ? 'bg-transparent border-white/10 text-zinc-400 hover:border-red-600/40 hover:text-red-500' 
                      : 'bg-red-600 border-red-600 text-white shadow-red-600/30 hover:bg-red-700 active:scale-95'
                  } ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {followLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      {isFollowing ? (
                        <>
                          <span className="group-hover:hidden">Following</span>
                          <span className="hidden group-hover:inline">Unfollow</span>
                        </>
                      ) : (
                        "Follow"
                      )}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Activity Stats */}
          {activeTab === "Reviews" && (
            <div className="mt-6 bg-gradient-to-br from-zinc-900/40 to-zinc-900/20 p-6 rounded-3xl border border-white/10 shadow-2xl">
              <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-5">
                Filter by Sentiment
              </h3>
              <div className="space-y-2">
                {sentiments.map(({ label, color, dot }) => (
                  <button
                    key={label}
                    onClick={() => setActiveSentiment(label)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${
                      activeSentiment === label
                        ? `${color} text-white shadow-lg`
                        : 'bg-black/30 text-zinc-500 hover:bg-black/50 border border-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${dot}`}></span>
                      {label}
                    </span>
                    {activeSentiment === label && (
                      <span className="text-[10px]">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="flex-1 space-y-6 w-full">
          <div className="flex bg-gradient-to-r from-zinc-900/40 to-zinc-900/20 p-1.5 rounded-2xl border border-white/10 w-fit shadow-xl backdrop-blur-sm">
            {["Reviews", "Collections"].map(tab => (
              <button 
                key={tab} 
                onClick={() => { 
                  setActiveTab(tab); 
                  setActiveSentiment("All"); 
                }} 
                className={`px-8 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${
                  activeTab === tab 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-gradient-to-br from-zinc-900/40 to-zinc-900/20 rounded-3xl border border-white/10 min-h-[500px] p-6 shadow-2xl backdrop-blur-sm">
            {filteredData.length > 0 ? (
              <div className="grid grid-cols-1 gap-5">
                {filteredData.map((item) => (
                  activeTab === "Reviews" ? (
                    <div 
                      key={item._id} 
                      className="bg-black/30 p-5 rounded-2xl border border-white/5 flex gap-6 hover:border-red-600/30 hover:bg-black/50 transition-all group shadow-lg"
                    >
                      <Link 
                        to={`/detail/${item.movie?.mediaType || 'movie'}/${item.movie?.tmdbId}`} 
                        className="w-24 h-32 rounded-xl overflow-hidden shrink-0 shadow-xl border border-white/10 block group-hover:scale-105 transition-transform duration-300"
                      >
                        <img 
                          src={`https://image.tmdb.org/t/p/w300${item.movie?.posterPath}`} 
                          className="w-full h-full object-cover" 
                          alt="poster" 
                        />
                      </Link>
                      <div className="flex-1 py-1">
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="text-base font-black italic uppercase tracking-tighter text-zinc-200 group-hover:text-red-500 transition-colors leading-tight">
                            {item.movie?.title}
                          </h4>
                          <span 
                            className={`${
                              sentiments.find(s => 
                                s.label.toLowerCase().replace(/\s/g, "") === 
                                item.sentiment?.toLowerCase().replace(/\s/g, "")
                              )?.color || 'bg-zinc-800'
                            } text-[7px] font-black uppercase px-3 py-1.5 rounded-full tracking-widest shrink-0 shadow-lg`}
                          >
                            {item.sentiment}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-xs mt-4 font-medium italic leading-relaxed">
                          "{item.comment}"
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div 
                      key={item._id} 
                      className="group flex items-center justify-between p-6 bg-black/30 rounded-2xl border border-white/5 hover:border-red-600/30 hover:bg-black/50 transition-all shadow-lg"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-red-600/30 transition-all">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-600 group-hover:text-red-600 transition-colors">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-black italic uppercase tracking-tighter text-zinc-300 group-hover:text-white transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest mt-1">
                            {item.movies?.length || 0} Items
                          </p>
                        </div>
                      </div>
                      <Link 
                        to={`/collection/${item._id}`} 
                        className="px-6 py-2 bg-zinc-900 border border-white/10 rounded-xl text-[8px] font-black uppercase hover:bg-red-600 hover:border-red-600 hover:text-white transition-all tracking-widest shadow-lg"
                      >
                        View
                      </Link>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px]">
                <div className="text-zinc-800 font-black italic text-2xl uppercase mb-3 opacity-20">
                  Empty
                </div>
                <p className="text-zinc-700 text-[9px] font-bold uppercase tracking-widest opacity-30">
                  No {activeTab.toLowerCase()} yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}