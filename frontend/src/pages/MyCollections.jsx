import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import CollectionModel from "../components/CollectionModel"; // Import your creation component

export default function MyCollections() {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // State for + button
  const [editFormData, setEditFormData] = useState({ title: "", description: "", isPublic: false, id: "" });

  const fetchLists = async () => {
    try {
      const res = await axios.get("/api/v1/lists/");
      setLists(res.data.data);
      if (selectedList) {
        const updated = res.data.data.find(l => l._id === selectedList._id);
        setSelectedList(updated);
      }
    } catch (err) { console.error("Error fetching lists:", err); }
  };

  useEffect(() => { fetchLists(); }, []);

  // --- COLLECTION MANAGEMENT LOGIC ---

  const handleDeleteList = async (id) => {
    if (window.confirm("Permanently delete this shelf?")) {
      try {
        await axios.delete(`/api/v1/lists/remove/${id}`);
        fetchLists();
        setOpenMenuId(null);
        if (selectedList?._id === id) setSelectedList(null);
      } catch (err) { console.error("Delete failed", err); }
    }
  };

  const openEditModal = (list) => {
    setEditFormData({ title: list.title, description: list.description || "", isPublic: list.isPublic, id: list._id });
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const handleRemoveMovie = async (movieId) => {
    try {
      await axios.delete(`/api/v1/lists/remove/${selectedList._id}/${movieId}`);
      setSelectedList(prev => ({
        ...prev,
        movies: prev.movies.filter(m => m.tmdbId !== movieId)
      }));
      fetchLists();
    } catch (err) { console.error("Movie removal failed", err); }
  };

  return (
    <div className="flex h-[calc(100vh-88px)] bg-black text-white overflow-hidden relative">
      
      {/* SIDEBAR: Collection Management */}
      <div className="w-[450px] border-r border-white/5 flex flex-col bg-[#0A0A0A] shrink-0">
        <div className="p-10 pb-6 flex justify-between items-center">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase">My <span className="text-red-600">Collections</span></h2>
          {/* TRIGGER FOR CREATION MODEL */}
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xl shadow-xl active:scale-90 transition-all"
          >
            +
          </button>
        </div>

        <div className="px-10 mb-8">
          <input 
            type="text" 
            placeholder="Search collections..."
            className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 text-sm font-bold outline-none focus:border-red-600/30 transition-all italic text-zinc-400"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-3 pb-10">
           {lists.filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase())).map(list => (
             <div 
               key={list._id} 
               onClick={() => setSelectedList(list)}
               className={`group relative flex items-center justify-between p-6 rounded-[2.5rem] border transition-all duration-300 cursor-pointer ${selectedList?._id === list._id ? 'bg-[#1A1A1A] border-red-600/40 shadow-xl' : 'border-transparent hover:bg-[#1A1A1A]/50'}`}
             >
                <div className="flex items-center gap-5">
                  <div className={`w-2.5 h-2.5 rounded-full ${list.isPublic ? 'bg-purple-600 shadow-[0_0_10px_purple]' : 'bg-red-600 shadow-[0_0_10px_red]'}`}></div>
                  <div>
                    <span className="font-bold text-zinc-200 tracking-tight italic text-lg leading-none block mb-2">{list.title}</span>
                    <span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">{list.movies?.length || 0} Films</span>
                  </div>
                </div>

                {/* 3-Dot Dropdown */}
                <div className="relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === list._id ? null : list._id); }}
                    className="text-zinc-600 hover:text-white p-2"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                  </button>
                  {openMenuId === list._id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>
                      <div className="absolute right-0 mt-2 w-40 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl z-20 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                         <button onClick={(e) => { e.stopPropagation(); openEditModal(list); }} className="w-full text-left px-4 py-3 text-xs font-black uppercase text-zinc-400 hover:bg-white/5 hover:text-white transition-all italic">Edit</button>
                         <button onClick={(e) => { e.stopPropagation(); handleDeleteList(list._id); }} className="w-full text-left px-4 py-3 text-xs font-black uppercase text-red-500 hover:bg-red-900 transition-all italic border-t border-white/5">Delete</button>
                      </div>
                    </>
                  )}
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* MAIN VIEW AREA */}
      <div className="flex-1 bg-black overflow-y-auto p-20 no-scrollbar">
         {selectedList ? (
           <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
              <div className="flex justify-between items-end mb-16 border-b border-white/5 pb-10">
                <h1 className="text-6xl font-black italic uppercase tracking-tighter">{selectedList.title}</h1>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                 {selectedList.movies?.map(movie => (
                   <div key={movie._id} className="group relative aspect-[2/3] bg-[#1A1A1A] rounded-[2rem] overflow-hidden border border-white/5 hover:border-red-600 transition-all shadow-2xl">
                      <Link to={`/movie/${movie.tmdbId}`}>
                        <img src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="poster" />
                      </Link>
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-6 pointer-events-none">
                         <p className="font-black italic text-xs uppercase tracking-tighter truncate mb-3 text-white">{movie.title}</p>
                         <button 
                           onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemoveMovie(movie.tmdbId); }}
                           className="pointer-events-auto w-full bg-red-600/20 hover:bg-red-600 py-3 rounded-xl text-[10px] font-black uppercase transition-all"
                         >
                           Remove
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
         ) : (
           <div className="h-full flex flex-col items-center justify-center opacity-10">
              <div className="text-[120px] font-black italic tracking-tighter text-zinc-800 leading-none">?</div>
              <h3 className="text-4xl font-black uppercase italic tracking-widest mt-10">Select a Collection</h3>
           </div>
         )}
      </div>

      {/* --- MODALS --- */}

      {/* CREATION MODEL INTEGRATION */}
      {isCreateModalOpen && (
        <CollectionModel 
          isOpen={isCreateModalOpen} 
          onClose={() => { setIsCreateModalOpen(false); fetchLists(); }} 
        />
      )}

      {/* EDIT MODAL OVERLAY */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
           <div className="bg-[#1A1A1A] border border-white/5 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl">
             <h3 className="text-white text-xl font-black italic uppercase tracking-tighter mb-8">Edit <span className="text-red-600">Collection</span></h3>
             <form className="space-y-6" onSubmit={async (e) => {
               e.preventDefault();
               await axios.put(`/api/v1/lists/edit/${editFormData.id}`, editFormData);
               fetchLists();
               setIsEditModalOpen(false);
             }}>
               <input className="w-full bg-[#262626] border border-white/5 rounded-xl p-4 text-white outline-none italic font-bold" value={editFormData.title} onChange={e => setEditFormData({...editFormData, title: e.target.value})} />
               <textarea className="w-full bg-[#262626] border border-white/5 rounded-xl p-4 text-white outline-none h-28 italic" value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})} />
               <div className="flex gap-4">
                 <button type="submit" className="flex-1 bg-red-600 py-4 rounded-xl font-black uppercase text-[10px] italic">Save</button>
                 <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-zinc-800 py-4 rounded-xl font-black uppercase text-[10px] italic">Cancel</button>
               </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
}