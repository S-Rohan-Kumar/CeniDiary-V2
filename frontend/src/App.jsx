import { use, useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SearchBar from './components/SearchBar.jsx'
import MovieGrid from './components/MovieGrid.jsx'
import MovieDetails from "./pages/MovieDetails.jsx"
import { Routes , Route , Link } from 'react-router-dom'
import Favorites from './pages/Favorites.jsx'


function App() {
  return (
    <div className="bg-gradient-to-br from-black via-zinc-950 to-black min-h-screen text-white relative overflow-hidden">
      {/* Ambient Background Effects (Global) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-950/10 rounded-full blur-3xl"></div>

      {/* Navigation Bar */}
      <nav className="relative z-20 flex justify-between items-center px-10 py-6 backdrop-blur-md border-b border-white/5">
        <Link
          to="/"
          className="text-3xl font-black tracking-tighter bg-gradient-to-r from-white to-red-500 bg-clip-text text-transparent"
        >
          CeniDiary 
        </Link>
        <div className="flex gap-6">
          <Link
            to="/"
            className="hover:text-red-500 transition-colors font-medium"
          >
            Home
          </Link>
          <Link
            to="/favorites"
            className="flex items-center gap-2 hover:text-red-500 transition-colors font-medium"
          >
            My Diary <span className="text-red-500">❤️</span>
          </Link>
        </div>
      </nav>

      {/* Route Content */}
      <div className="relative z-10">
        <Routes>
          {/* HOME ROUTE */}
          <Route
            path="/"
            element={
              <div className="p-10">
                <div className="text-center mb-16">
                  <h1 className="text-6xl md:text-7xl font-black mb-4 tracking-tighter bg-gradient-to-r from-white via-red-200 to-red-400 bg-clip-text text-transparent">
                    Explore Cinema
                  </h1>
                  <p className="text-zinc-500 text-lg">
                    Your personal movie logging journey.
                  </p>
                </div>
                <SearchBar />
                <MovieGrid />
              </div>
            }
          />

          {/* FAVORITES ROUTE */}
          <Route path="/favorites" element={<Favorites />} />

          {/* MOVIE DETAILS ROUTE */}
          <Route path="/movie/:id" element={<MovieDetails />} />
        </Routes>
      </div>
    </div>
  );
}

export default App