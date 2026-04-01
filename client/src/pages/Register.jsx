import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = () => {
    const result = register(email, password);

    if (result === "exists") {
      setMessage("User already exists");
    } else if (result === "registered") {
      setMessage("Registration successful! Please login.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="bg-white p-10 rounded-xl shadow-md w-96">

        <h2 className="text-3xl font-heading text-midnight mb-6">
          Register
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 border rounded-lg"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-2 border rounded-lg"
          onChange={(e) => setPassword(e.target.value)}
        />

        {message && (
          <p className="text-sm text-midnight mb-4">
            {message}
          </p>
        )}

        <button
          onClick={handleRegister}
          className="w-full bg-gold text-midnight py-2 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Register
        </button>

      </div>
    </div>
  );
}

export default Register;