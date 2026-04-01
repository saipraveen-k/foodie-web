import { useState, useContext } from "react";
import { ComplaintContext } from "../context/ComplaintContext";
import { AuthContext } from "../context/AuthContext";

function Complaint() {

  const { addComplaint } = useContext(ComplaintContext);
  const { user } = useContext(AuthContext);

  const [text, setText] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!text) return;

    addComplaint({
      user: user.email,
      text,
      date: new Date().toLocaleString()
    });

    setMessage("Complaint submitted successfully!");
    setText("");
  };

  return (
    <div className="min-h-screen bg-cream p-10">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md">

        <h2 className="text-3xl font-heading text-midnight mb-6">
          Submit Complaint
        </h2>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe your issue..."
          className="w-full p-4 border rounded-lg mb-4"
        />

        <button
          onClick={handleSubmit}
          className="bg-gold text-midnight px-6 py-2 rounded-lg font-semibold"
        >
          Submit
        </button>

        {message && (
          <p className="mt-4 text-green-600">
            {message}
          </p>
        )}

      </div>
    </div>
  );
}

export default Complaint;