import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import CollectionModel from "../components/CollectionModel";

export default function MyCollections() {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
    setEditFormData({ title: list.title, description: list.descriptoin || "", isPublic: list.isPublic, id: list._id });
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const handleRemoveMovie = async (movieId, mediaType) => {
    try {
      await axios.delete(`/api/v1/lists/remove/${selectedList._id}/${movieId}?mediaType=${mediaType || 'movie'}`);
      
      setSelectedList(prev => ({
        ...prev,
        movies: prev.movies.filter(m => !(m.tmdbId === movieId && (m.mediaType === mediaType || !m.mediaType)))
      }));
      fetchLists();
    } catch (err) { console.error("Movie removal failed", err); }
  };

  return (
    <div className="flex h-[calc(100vh-88px)] bg-black text-white overflow-hidden relative text-left selection:bg-red-600/30">
      
      <div className="w-[400px] border-r border-white/5 flex flex-col bg-[#0A0A0A] shrink-0">
        <div className="p-8 pb-4 flex justify-between items-center">
          <h2 className="text-lg font-black italic tracking-tighter uppercase">My <span className="text-red-600"> Collection</span></h2>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-lg shadow-xl active:scale-90 transition-all hover:bg-red-700"
          >
            +
          </button>
        </div>

        <div className="px-8 mb-6">
          <input 
            type="text" 
            placeholder="Search shelves..."
            className="w-full bg-[#111] border border-white/5 rounded-xl p-4 text-xs font-bold outline-none focus:border-red-600/30 transition-all italic text-zinc-500"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-5 space-y-2 pb-10">
           {lists.filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase())).map(list => (
             <div 
               key={list._id} 
               onClick={() => setSelectedList(list)}
               className={`group relative flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${selectedList?._id === list._id ? 'bg-[#151515] border-red-600/20 shadow-lg' : 'border-transparent hover:bg-[#111]'}`}
             >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${list.isPublic ? 'bg-purple-600' : 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]'}`}></div>
                  <div>
                    <span className="font-bold text-zinc-300 tracking-tight italic text-base block mb-1 uppercase">{list.title}</span>
                    <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">{list.movies?.length || 0} Entries</span>
                  </div>
                </div>

                <div className="relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === list._id ? null : list._id); }}
                    className="text-zinc-700 hover:text-white p-2 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                  </button>
                  {openMenuId === list._id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>
                      <div className="absolute right-0 mt-2 w-36 bg-[#121212] border border-white/10 rounded-xl shadow-2xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                         <button onClick={(e) => { e.stopPropagation(); openEditModal(list); }} className="w-full text-left px-4 py-3 text-[9px] font-black uppercase text-zinc-500 hover:bg-white/5 hover:text-white transition-all italic tracking-widest">Edit</button>
                         <button onClick={(e) => { e.stopPropagation(); handleDeleteList(list._id); }} className="w-full text-left px-4 py-3 text-[9px] font-black uppercase text-red-500 hover:bg-red-900/20 transition-all italic border-t border-white/5 tracking-widest">Delete</button>
                      </div>
                    </>
                  )}
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* MAIN VIEW AREA */}
      <div className="flex-1 bg-black overflow-y-auto p-12 md:p-16 no-scrollbar">
         {selectedList ? (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col mb-12 border-b border-white/5 pb-8">
                <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-3 leading-none text-white">{selectedList.title}</h1>
                <p className="text-zinc-600 font-medium italic text-sm max-w-2xl leading-relaxed">"{selectedList.descriptoin || "Collection empty of description."}"</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                 {selectedList.movies?.map(movie => (
                   <div key={movie._id} className="group relative aspect-[2/3] bg-[#0F0F0F] rounded-2xl overflow-hidden border border-white/5 hover:border-red-600/50 transition-all duration-500 shadow-xl">
                      <Link to={`/detail/${movie.mediaType || 'movie'}/${movie.tmdbId}`}>
                        <img src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-700" alt="poster" />
                      </Link>
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-5 pointer-events-none">
                         <p className="font-black italic text-[9px] uppercase tracking-widest truncate mb-3 text-white">{movie.title}</p>
                         <button 
                           onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemoveMovie(movie.tmdbId, movie.mediaType); }}
                           className="pointer-events-auto w-full bg-red-600/10 hover:bg-red-600 py-2.5 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] transition-all"
                         >
                           Remove
                         </button>
                      </div>
                   </div>
                 ))}
                 {selectedList.movies?.length === 0 && (
                   <div className="col-span-full py-24 text-center opacity-10">
                     <p className="text-2xl font-black italic uppercase tracking-widest">Collection is currently empty</p>
                   </div>
                 )}
              </div>
           </div>
         ) : (
           <div className="h-full flex flex-col items-center justify-center select-none">
              <div className="text-[120px] font-black italic tracking-tighter text-zinc-900 leading-none">CENI</div>
              <h3 className="text-xs font-black uppercase italic tracking-[0.6em] mt-2 text-zinc-800">Select a collection to explore</h3>
           </div>
         )}
      </div>

      {/* --- MODALS --- */}

      {isCreateModalOpen && (
        <CollectionModel 
          isOpen={isCreateModalOpen} 
          onClose={() => { setIsCreateModalOpen(false); fetchLists(); }} 
        />
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
           <div className="bg-[#0A0A0A] border border-white/5 w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300">
             <h3 className="text-white text-xl font-black italic uppercase tracking-tighter mb-8 text-center">Edit <span className="text-red-600">Shelf</span></h3>
             <form className="space-y-6" onSubmit={async (e) => {
               e.preventDefault();
               await axios.put(`/api/v1/lists/edit/${editFormData.id}`, editFormData);
               fetchLists();
               setIsEditModalOpen(false);
             }}>
               <div className="space-y-2">
                 <label className="text-[8px] font-black uppercase text-zinc-700 tracking-widest italic ml-2">Title</label>
                 <input className="w-full bg-[#111] border border-white/5 rounded-xl p-4 text-white outline-none italic font-bold text-base focus:border-red-600/40 transition-all" value={editFormData.title} onChange={e => setEditFormData({...editFormData, title: e.target.value})} />
               </div>
               <div className="space-y-2">
                 <label className="text-[8px] font-black uppercase text-zinc-700 tracking-widest italic ml-2">Description</label>
                 <textarea className="w-full bg-[#111] border border-white/5 rounded-xl p-4 text-white outline-none h-28 italic font-medium text-sm focus:border-red-600/40 transition-all resize-none" value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})} />
               </div>
               <div className="flex gap-4 pt-4">
                 <button type="submit" className="flex-1 bg-red-600 py-4 rounded-xl font-black uppercase text-[9px] italic tracking-widest active:scale-95 transition-all shadow-lg shadow-red-600/10">Save</button>
                 <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-zinc-900 py-4 rounded-xl font-black uppercase text-[9px] italic tracking-widest text-zinc-500">Cancel</button>
               </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
}