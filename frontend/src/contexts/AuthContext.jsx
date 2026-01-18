import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get("/api/v1/users/me");
        setUser(response.data.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  const login = async (formdata) => {
    const response = await axios.post("/api/v1/users/login", formdata);
    setUser(response.data.data.user);
    return response.data;
  };

  const setLocalUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const logout = async () => {
    await axios.post("/api/v1/users/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, setLocalUser ,  isAuthenticated: !!user, loading }}
    >
      {loading ? (
        <div className="h-screen w-screen flex items-center justify-center bg-black text-white">
          <p className="animate-pulse">Initializing CeniDiary...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
