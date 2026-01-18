import React, { useState } from "react";
import axios from "axios";

const EditProfileModal = ({ user, onClose }) => {
  // We are excluding email changes as per your new requirement
  const [fullname, setFullname] = useState(user?.fullname || "");
  const [username, setUsername] = useState(user?.username || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(user?.avatar);
  const [loading, setLoading] = useState(false);

  // Handle local image preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use FormData to send both text and files in one request
      const formData = new FormData();
      formData.append("fullname", fullname);
      formData.append("username", username);
      
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      // Single PATCH request to your combined controller
      await axios.patch("/api/v1/users/me/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Refresh the page to reflect the brand-new data
      window.location.reload(); 
    } catch (err) {
      console.error("Update failed:", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
      <div className="bg-[#1A1A1A] border border-white/5 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        
        <h3 className="text-white text-xl font-black italic uppercase tracking-tighter mb-10 text-left">
          Edit <span className="text-red-600">Profile</span>
        </h3>
        
        <form onSubmit={handleUpdate} className="space-y-6 text-left">
          
          {/* Avatar Picker */}
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="w-24 h-24 rounded-full border-2 border-red-600 overflow-hidden shadow-lg shadow-red-600/20">
              <img src={preview} className="w-full h-full object-cover" alt="preview" />
            </div>
            <label className="text-[10px] font-black uppercase text-red-500 cursor-pointer hover:text-white transition-colors italic tracking-[0.2em]">
              Change Photo
              <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            </label>
          </div>

          {/* Full Name Field */}
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-600 mb-2 tracking-widest italic">Full Name</p>
            <input 
              className="w-full bg-[#262626] border border-white/5 rounded-xl p-4 text-white outline-none focus:border-red-600 transition-all font-bold italic"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Enter full name"
            />
          </div>

          {/* Username Field */}
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-600 mb-2 tracking-widest italic">Username</p>
            <input 
              className="w-full bg-[#262626] border border-white/5 rounded-xl p-4 text-white outline-none focus:border-red-600 transition-all font-bold italic"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-red-600 py-4 rounded-xl font-black uppercase text-[10px] italic shadow-lg shadow-red-600/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "Syncing..." : "Save Changes"}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-zinc-800 py-4 rounded-xl font-black uppercase text-[10px] italic text-zinc-400 hover:bg-zinc-700 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;