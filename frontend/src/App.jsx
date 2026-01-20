import { Routes, Route } from "react-router-dom";
import "./App.css";

// Components & Pages
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import MovieDetails from "./pages/MovieDetails.jsx";
import Favorites from "./pages/Favorites.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import MyCollections from "./pages/MyCollections.jsx";
import PublicProfile from "./pages/PublicProfile.jsx";
import CollectionView from "./components/CollectionView.jsx";

// Context
import { useAuth } from "./contexts/AuthContext.jsx";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-black min-h-screen text-white selection:bg-red-600/30">
      {isAuthenticated && <Navbar />} 

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* PROTECTED ROUTES */}
        {isAuthenticated ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/favorites" element={<Favorites />} />
            
            {/* CORRECTED ROUTE: Supports both media types */}
            <Route path="/detail/:mediaType/:id" element={<MovieDetails />} />
            
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-collections" element={<MyCollections />} />
            <Route path="/u/:username" element={<PublicProfile />} />
            <Route path="/collection/:listId" element={<CollectionView />} />
          </>
        ) : (
          <Route path="*" element={<Login />} />
        )}
      </Routes>
    </div>
  );
}

export default App;