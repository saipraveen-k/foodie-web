import { createContext, useState, useEffect, useMemo, useCallback, useContext } from "react";
import axios from "axios";

export const AuthContext = createContext();

// Custom hook for using AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        
        if (storedToken && storedUser && storedUser !== "undefined") {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          
          // Set default authorization header for axios
          axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Clear invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log("🔐 Login attempt:", { email, passwordLength: password ? password.length : 0 });

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("✅ Login response:", res.status, res.data);

      if (res.status === 200 && res.data.token) {
        const token = res.data.token;

        // Decode JWT payload
        const payload = JSON.parse(atob(token.split(".")[1]));

        const loggedUser = {
          id: payload.id,
          role: payload.role,
          email: payload.email || email
        };

        // Store in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(loggedUser));

        // Update state
        setUser(loggedUser);
        setIsAuthenticated(true);

        // Set default authorization header for future requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        console.log("✅ Login successful, user:", loggedUser);

        return { success: true, user: loggedUser };
      } else {
        console.error("❌ Unexpected response:", res.data);
        return { 
          success: false, 
          message: res.data.message || "Login failed" 
        };
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
        return { 
          success: false, 
          message: error.response.data.message || "Login failed" 
        };
      } else if (error.request) {
        console.error("No response received:", error.request);
        return { 
          success: false, 
          message: "Server not responding. Please ensure backend is running on port 5000." 
        };
      } else {
        console.error("Error:", error.message);
        return { 
          success: false, 
          message: error.message || "Login failed" 
        };
      }
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
      console.error("Register error:", error);
      return false;
    }
  };

  const logout = useCallback(() => {
    // Remove token from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Remove authorization header
    delete axios.defaults.headers.common["Authorization"];
    
    // Clear state
    setUser(null);
    setIsAuthenticated(false);
    
    console.log("🚪 User logged out");
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register
  }), [user, isAuthenticated, loading, login, logout, register]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}