import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { MovieProvider } from "./contexts/MovieContext.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import axios from "axios";
axios.defaults.baseURL = import.meta.env.PROD 
  ? "https://cenidiary-v2.onrender.com" 
  : "";

axios.defaults.withCredentials = true;  

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MovieProvider>
          <App />
        </MovieProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
