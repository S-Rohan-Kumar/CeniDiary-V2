import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false); // Close dropdown on logout
    navigate("/login");
  };

  return (
    <nav className="relative z-[100] flex justify-between items-center px-8 md:px-12 py-6 backdrop-blur-xl border-b border-white/5 bg-black/20">
      {/* BRAND LOGO */}
      <Link
        to="/"
        className="text-3xl font-black tracking-tighter bg-gradient-to-r from-white to-red-500 bg-clip-text text-transparent hover:scale-105 transition-transform italic"
      >
        CeniDiary
      </Link>

      <div className="flex items-center gap-8">
        <Link to="/" className="text-sm font-bold uppercase tracking-widest hover:text-red-500 transition-colors">
          Home
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 pl-6 border-l border-white/10 relative">
              <div className="text-right hidden md:block">
                <p className="text-xs font-black text-white uppercase tracking-tighter italic">{user?.username}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">Member</p>
              </div>
              
              <div className="relative">
                {/* Profile Avatar Trigger */}
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-10 h-10 rounded-full border-2 border-red-600 overflow-hidden hover:border-white transition-all shadow-lg shadow-red-600/20"
                >
                  <img src={user?.avatar} alt="avatar" className="w-full h-full object-cover" />
                </button>

                {/* --- THE DISAPPEARING LOGIC --- */}
                {isDropdownOpen && (
                  <>
                    {/* INVISIBLE CLICK-AWAY OVERLAY */}
                    {/* This div covers the whole screen and closes the menu when clicked */}
                    <div 
                      className="fixed inset-0 z-10 cursor-default" 
                      onClick={() => setIsDropdownOpen(false)}
                    ></div>

                    {/* DROPDOWN MENU */}
                    <div className="absolute right-0 mt-4 w-60 bg-[#121212] border border-white/5 rounded-[1.5rem] shadow-2xl p-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                      <DropdownLink 
                        to="/profile" 
                        label="My Profile" 
                        onClick={() => setIsDropdownOpen(false)} 
                      />
                      <DropdownLink 
                        to="/my-collections" 
                        label="My Collections" 
                        onClick={() => setIsDropdownOpen(false)} 
                      />
                      
                      <div className="h-[1px] bg-white/5 my-2 mx-2"></div>
                      
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-3.5 rounded-xl text-red-500/80 hover:text-red-500 hover:bg-red-500/5 transition-all font-bold text-sm italic"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Link to="/login" className="bg-red-600 text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-full shadow-lg">
            Join Free
          </Link>
        )}
      </div>
    </nav>
  );
};

// Reusable Dropdown Item with Click Handler to close menu
const DropdownLink = ({ to, label, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className="flex items-center gap-3 p-3.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all font-bold text-sm italic tracking-tight"
  >
    {label}
  </Link>
);

export default Navbar;