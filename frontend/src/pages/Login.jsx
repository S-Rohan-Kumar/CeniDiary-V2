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
  const [showPassword, setShowPassword] = useState(false);
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

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md bg-zinc-950/70 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl"
      >
        <h2 className="text-3xl font-black mb-2 text-white">
          Welcome <span className="text-red-500">Back</span>
        </h2>
        <p className="text-zinc-500 mb-8 text-sm">
          Sign in to sync your diary.
        </p>

        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-xl mb-6 text-sm">
            {successMsg}
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-5 py-4 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-red-500/50 focus:bg-zinc-900/80 transition-all"
            onChange={handleChange}
            required
          />
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-5 py-4 pr-14 text-white text-sm placeholder:text-zinc-600 outline-none focus:border-red-500/50 focus:bg-zinc-900/80 transition-all"
              onChange={handleChange}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M13.359 11.238C14.6 10.141 15.5 8.5 15.5 8s-3-5.5-7.5-5.5c-1.379 0-2.63.34-3.742.92z" />
                  <path d="M11.297 9.176a3.5 3.5 0 0 0-4.473-4.473z" />
                  <path d="M3.35 5.47A13 13 0 0 0 .5 8s3 5.5 7.5 5.5a7 7 0 0 0 2.548-.467z" />
                  <path d="M14.854 15.146 1.146 1.854l.708-.708 13.708 13.292z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full mt-8 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-4 rounded-xl shadow-lg shadow-red-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Authenticating..." : "Sign In"}
        </button>

        <p className="text-center mt-8 text-zinc-500 text-sm">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-red-500 font-semibold hover:text-red-400 hover:underline transition-colors"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}