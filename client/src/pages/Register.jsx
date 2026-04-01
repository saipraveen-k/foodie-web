import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setMessage("");
    setIsLoading(true);

    const success = await register(name, email, password);

    if (success) {
      setMessage("Registration successful! Please login.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } else {
      setMessage("Registration failed. Please try again.");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="bg-white p-10 rounded-xl shadow-md w-96">

        <h2 className="text-3xl font-heading text-midnight mb-6">
          Register
        </h2>

        <input
          type="text"
          placeholder="Name"
          className="w-full mb-4 px-4 py-2 border rounded-lg"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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

        {message && (
          <p className="text-sm text-midnight mb-4">
            {message}
          </p>
        )}

        <button
          onClick={handleRegister}
          disabled={isLoading}
          className="w-full bg-gold text-midnight py-2 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {isLoading ? "Registering..." : "Register"}
        </button>

      </div>
    </div>
  );
}

export default Register;