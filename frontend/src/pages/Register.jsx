import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [passvis, setpassvis] = useState(false);
  const passref = useRef();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      data.append("avatar", avatar);

      const response = await axios.post("/api/v1/users/register", data);

      if (response.data.success) {
        navigate("/login", {
          state: { message: "Curtain rising! Please sign in." },
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Try a unique username.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen py-20 px-4 bg-black relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 -right-40 w-96 h-96 bg-red-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-red-800/20 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md bg-zinc-950/70 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl"
      >
        <h2 className="text-3xl font-black mb-2 text-white">
          Join the <span className="text-red-500">Diary</span>
        </h2>
        <p className="text-zinc-500 mb-8 text-sm">
          Start your cinematic journey today.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-red-600/40 hover:border-red-600/70 flex items-center justify-center overflow-hidden bg-zinc-900/50 transition-all">
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-zinc-600 text-xs font-semibold">
                Avatar
              </span>
            )}
          </div>
          <label className="mt-4 cursor-pointer text-xs font-bold text-red-500 hover:text-red-400 transition-colors uppercase tracking-wider">
            Upload Photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              required
            />
          </label>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              name="fullname"
              placeholder="Full Name"
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600 outline-none focus:border-red-500/50 focus:bg-zinc-900/80 text-sm transition-all"
              onChange={handleChange}
              required
            />
            <input
              name="username"
              placeholder="Username"
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600 outline-none focus:border-red-500/50 focus:bg-zinc-900/80 text-sm transition-all"
              onChange={handleChange}
              required
            />
          </div>
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600 outline-none focus:border-red-500/50 focus:bg-zinc-900/80 text-sm transition-all"
            onChange={handleChange}
            required
          />
          <div className="relative">
            <input
              name="password"
              type={passvis ? "text" : "password"}
              placeholder="Password"
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 pr-12 text-white placeholder:text-zinc-600 outline-none focus:border-red-500/50 focus:bg-zinc-900/80 text-sm transition-all"
              onChange={handleChange}
              required
            />

            <button
              type="button"
              onClick={() => setpassvis(!passvis)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
            >
              {passvis ? (
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
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="text-center mt-8 text-zinc-500 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-red-500 font-semibold hover:text-red-400 hover:underline transition-colors"
          >
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}