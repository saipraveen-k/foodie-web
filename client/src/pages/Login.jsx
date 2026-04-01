import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    
    console.log("🔑 Handle login clicked with:", { email, passwordLength: password.length });
    setError("");
    setIsLoading(true);

    try {
      const result = await login(email, password);

      console.log("🔑 Login result:", result);

      if (result && result.success) {
        console.log("✅ Login successful, navigating to home...");
        setError(""); // Clear any existing error
        setEmail(""); // Clear email field
        setPassword(""); // Clear password field
        
        // Small delay to ensure state updates before navigation
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 100);
      } else {
        // Show actual error message from backend or default
        const errorMessage = result && result.message 
          ? result.message 
          : "Invalid email or password";
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // If already authenticated, redirect to home
  if (isAuthenticated) {
    console.log("⚠️ User already authenticated, redirecting to home");
    navigate("/", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="bg-white p-10 rounded-xl shadow-md w-96">

        <h2 className="text-3xl font-heading text-midnight mb-6">
          Login
        </h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-4 px-4 py-2 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full mb-4 px-4 py-2 border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-red-500 text-sm mb-4">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-gold text-midnight py-2 rounded-lg font-semibold transition ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
            }`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm mt-4 text-center">
          Don't have an account?{" "}
          <span
            className="text-gold cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>

      </div>
    </div>
  );
}

export default Login;