import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CollectionModel({ movieDbId, mediaType, onClose, triggerToast }) {
  const [view, setView] = useState("list");
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPublic: false,
  });

  const fetchLists = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/lists/");
      setLists(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleToggleMovie = async (listId, isInside) => {
    try {
      if (isInside) {
        await axios.delete(`/api/v1/lists/remove/${listId}/${movieDbId}?mediaType=${mediaType || 'movie'}`);
        triggerToast?.("Removed from Collection!");
      } else {
        await axios.post(`/api/v1/lists/add/${listId}/${movieDbId}`, { 
          mediaType: mediaType || 'movie' 
        });
        triggerToast?.("Added to Collection. Check Out");
      }
      fetchLists();
    } catch (err) {
      console.error("Operation failed:", err.response?.data || err.message);
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      const res = await axios.post("/api/v1/lists/create", {
        title: formData.title,
        description: formData.description,
        isPublic: formData.isPublic
      });
      console.log(formData)
      if (res.status === 201) {
        triggerToast?.("Collection Created Successfully!");
        setFormData({ title: "", description: "", isPublic: false });
        setView("list"); 
        fetchLists();
      }
    } catch (err) {
      console.error("Creation failed", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 text-left">
      <div className="bg-[#1A1A1A] border border-white/5 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative">
        
        {view === "list" ? (
          <>
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-white text-xl font-bold tracking-tight">
                Save to Collection
              </h3>
              <button
                onClick={onClose}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto no-scrollbar">
              {lists.map((list) => {
                const isInside = list.movies.some(
                  (m) => m.tmdbId === Number(movieDbId) && (m.mediaType === mediaType || !m.mediaType)
                );
                return (
                  <div
                    key={list._id}
                    onClick={() => handleToggleMovie(list._id, isInside)}
                    className="flex items-center justify-between bg-[#262626] p-5 rounded-2xl border border-white/5 cursor-pointer hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isInside ? "bg-red-600 border-red-600" : "border-zinc-700"}`}
                      >
                        {isInside && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                      <span className="text-zinc-200 font-bold text-sm">
                        {list.title}
                      </span>
                    </div>

                    {list.isPublic ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#525252" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#525252" strokeWidth="2.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setView("create")}
              className="w-full mt-10 flex items-center gap-3 bg-[#1A1A1A] border border-dashed border-white/10 p-5 rounded-2xl text-zinc-300 font-bold text-sm hover:border-white/20 transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-black text-lg">+</div>
              Create New Collection
            </button>
          </>
        ) : (
          /* --- VIEW 2: CREATE COLLECTION FORM --- */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-white text-xl font-bold tracking-tight">
                Create New Collection
              </h3>
              <button
                onClick={() => setView("list")}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500 mb-2">
                  <span>Collection Name</span>
                  <span>{formData.title.length}/50</span>
                </div>
                <input
                  type="text"
                  placeholder="Enter a name for your collection"
                  maxLength={50}
                  className="w-full bg-[#262626] border border-white/5 rounded-xl p-4 text-white outline-none focus:border-red-600 transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500 mb-2">
                  <span>Description</span>
                  <span>{formData.description.length}/150</span>
                </div>
                <textarea
                  placeholder="Add a description (optional)"
                  maxLength={150}
                  className="w-full bg-[#262626] border border-white/5 rounded-xl p-4 text-white outline-none focus:border-red-600 transition-all h-28 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase text-zinc-500 mb-3">Visibility</p>
                <div className="flex bg-[#262626] p-1 rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPublic: false })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${!formData.isPublic ? "bg-zinc-700 text-white shadow-lg" : "text-zinc-500"}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    Private
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPublic: true })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${formData.isPublic ? "bg-zinc-700 text-white shadow-lg" : "text-zinc-500"}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                    Public
                  </button>
                </div>
                <p className="text-[10px] text-zinc-600 mt-3 italic font-medium">
                  {formData.isPublic ? "Anyone can see this watchlist" : "Only you can see this watchlist"}
                </p>
              </div>

              <button
                onClick={handleCreateCollection}
                disabled={!formData.title.trim()}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black py-4 rounded-xl text-sm transition-all active:scale-95 shadow-xl shadow-red-600/20"
              >
                Create Collection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}