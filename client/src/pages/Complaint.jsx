import { useState, useEffect, useContext } from "react";
import api from "../utils/axiosSetup";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Complaint() {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchComplaints();
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/my-orders");
      if (res.data.orders) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await api.get("/complaints/my-complaints");
      if (res.data.complaints) {
        setComplaints(res.data.complaints);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedOrderId) {
      setErrorMessage("Please select an order");
      return;
    }

    if (!message || message.trim().length < 10) {
      setErrorMessage("Message must be at least 10 characters long");
      return;
    }

    if (message.trim().length > 1000) {
      setErrorMessage("Message cannot exceed 1000 characters");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      await api.post("/complaints/submit", {
        orderId: selectedOrderId,
        message: message.trim()
      });

      setSuccessMessage("Complaint submitted successfully!");
      setMessage("");
      setSelectedOrderId("");
      fetchComplaints();
    } catch (error) {
      console.error("Error submitting complaint:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to submit complaint"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream p-10">
      <div className="max-w-3xl mx-auto">
        
        <h2 className="text-3xl font-heading text-midnight mb-8">
          Submit <span className="text-gold">Complaint</span>
        </h2>

        {/* Submit Complaint Form */}
        <div className="bg-white p-8 rounded-xl shadow-md mb-8">
          <form onSubmit={handleSubmit}>
            
            <div className="mb-6">
              <label className="block text-midnight font-semibold mb-2">
                Select Order
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-gold"
              >
                <option value="">-- Select an order --</option>
                {orders.map(order => (
                  <option key={order._id} value={order._id}>
                    Order #{order._id.slice(-6).toUpperCase()} - ₹{order.totalAmount} - {order.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-midnight font-semibold mb-2">
                Describe your issue
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your issue in detail..."
                className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-gold"
                rows={5}
              />
              <p className="text-sm text-midnight opacity-70 mt-1">
                {message.length}/1000 characters (minimum 10)
              </p>
            </div>

            {successMessage && (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4">
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gold text-midnight py-3 rounded-lg font-semibold transition ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
              }`}
            >
              {loading ? "Submitting..." : "Submit Complaint"}
            </button>
          </form>
        </div>

        {/* Complaint History */}
        {complaints.length > 0 && (
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h3 className="text-2xl font-heading text-midnight mb-6">
              Complaint History
            </h3>

            <div className="space-y-4">
              {complaints.map(complaint => (
                <div
                  key={complaint._id}
                  className="border rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-midnight opacity-70">
                      {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      complaint.status === 'Resolved'
                        ? 'bg-green-100 text-green-700'
                        : complaint.status === 'In Progress'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {complaint.status}
                    </span>
                  </div>
                  <p className="text-midnight">{complaint.message}</p>
                  
                  {complaint.adminResponse && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-semibold text-midnight">Admin Response:</p>
                      <p className="text-sm text-midnight opacity-80 mt-1">
                        {complaint.adminResponse}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Complaint;