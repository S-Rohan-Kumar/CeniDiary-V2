import { use, useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import SearchBar from "./components/SearchBar.jsx";
import MovieGrid from "./components/MovieGrid.jsx";
import MovieDetails from "./pages/MovieDetails.jsx";
import { Routes, Route, Link } from "react-router-dom";
import Favorites from "./pages/Favorites.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import { useAuth } from "./contexts/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Profile from "./pages/Profile.jsx";
import MyCollections from "./pages/MyCollections.jsx";
import PublicProfile from "./pages/PublicProfile.jsx";


function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-black min-h-screen text-white">
      {/* If logged in, show Navbar. If not, hide it. */}
      {isAuthenticated && <Navbar />} 

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* PROTECTED ROUTES: Only show if authenticated */}
        {isAuthenticated ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-collections" element={<MyCollections />} />
            <Route path="/u/:username" element={<PublicProfile />} />
          </>
        ) : (
          /* REDIRECT: If guest tries to access anything else, send to login */
          <Route path="*" element={<Login />} />
        )}
      </Routes>
    </div>
  );
}

export default App;
