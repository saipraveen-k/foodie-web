import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    const success = await login(email, password);

    if (success) {
      navigate("/"); // go to home after login
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="bg-white p-10 rounded-xl shadow-md w-96">

        <h2 className="text-3xl font-heading text-midnight mb-6">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 border rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-2 border rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-500 text-sm mb-4">
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          className="w-full bg-gold text-midnight py-2 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Login
        </button>

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