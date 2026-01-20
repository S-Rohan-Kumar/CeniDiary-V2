import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";

export default function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const successMsg = location.state?.message;

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(credentials);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4 bg-black relative overflow-hidden">
    
    <div className="absolute inset-0">
      <div className="absolute top-0 -left-40 w-96 h-96 bg-red-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-red-800/20 rounded-full blur-[120px] animate-pulse"></div>
    </div>

    <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-md bg-zinc-950/70 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl">
      <h2 className="text-3xl font-black mb-2 text-white">
        Welcome <span className="text-red-500">Back</span>
      </h2>
      <p className="text-zinc-500 mb-8 text-sm">Sign in to sync your diary.</p>

      {successMsg && <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-xl mb-6 text-sm">{successMsg}</div>}
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-6 text-sm">{error}</div>}

      <div className="space-y-4">
        <input 
          name="email" 
          type="email" 
          placeholder="Email" 
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-5 py-4 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-red-500/50 focus:bg-zinc-900/80 transition-all" 
          onChange={handleChange} 
          required 
        />
        <input 
          name="password" 
          type="password" 
          placeholder="Password" 
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-5 py-4 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-red-500/50 focus:bg-zinc-900/80 transition-all" 
          onChange={handleChange} 
          required 
        />
      </div>

      <button 
        disabled={loading} 
        type="submit" 
        className="w-full mt-8 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-4 rounded-xl shadow-lg shadow-red-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? "Authenticating..." : "Sign In"}
      </button>

      <p className="text-center mt-8 text-zinc-500 text-sm">
        Don't have an account? <Link to="/register" className="text-red-500 font-semibold hover:text-red-400 hover:underline transition-colors">Register</Link>
      </p>
    </form>
  </div>
  );
}