import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser && storedUser !== "undefined") {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email, password) => {
    try {

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      const token = res.data.token;

      const payload = JSON.parse(atob(token.split(".")[1]));

      const loggedUser = {
        id: payload.id,
        role: payload.role,
        email: email   // ✅ we store email manually
      };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(loggedUser));

      setUser(loggedUser);

      return true;

    } catch (error) {
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {

      await axios.post(
        "http://localhost:5000/api/auth/register",
        { name, email, password }
      );

      return true;

    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}