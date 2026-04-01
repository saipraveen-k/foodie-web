import { useState, useEffect, useContext } from "react";
import api from "../utils/axiosSetup";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Admin() {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newFood, setNewFood] = useState({
    name: "",
    price: "",
    category: "",
    veg: true,
    calories: "",
    protein: "",
    image: ""
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user && user.role !== "admin") {
      navigate("/");
      return;
    }

    fetchData();
  }, [isAuthenticated, user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, complaintsRes, foodsRes] = await Promise.all([
        api.get("/orders/admin/all"),
        api.get("/complaints/admin/all"),
        api.get("/food")
      ]);

      setOrders(ordersRes.data.orders || []);
      setComplaints(complaintsRes.data.complaints || []);
      setFoods(foodsRes.data.foods || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      setErrorMessage("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFood = async () => {
    if (
      !newFood.name ||
      !newFood.price ||
      !newFood.category ||
      !newFood.calories ||
      !newFood.protein
    ) {
      setErrorMessage("Please fill all required fields");
      return;
    }

    try {
      setSuccessMessage("");
      setErrorMessage("");

      await api.post("/food/add", {
        name: newFood.name.trim(),
        price: Number(newFood.price),
        category: newFood.category.trim(),
        veg: newFood.veg,
        calories: Number(newFood.calories),
        protein: Number(newFood.protein),
        image: newFood.image || `https://source.unsplash.com/400x300/?${newFood.name.split(' ')[0]},food`
      });

      setSuccessMessage("Food item added successfully!");
      setNewFood({
        name: "",
        price: "",
        category: "",
        veg: true,
        calories: "",
        protein: "",
        image: ""
      });
      fetchData();
    } catch (error) {
      console.error("Error adding food:", error);
      setErrorMessage(error.response?.data?.message || "Failed to add food item");
    }
  };

  const handleDeleteFood = async (foodId) => {
    if (!window.confirm("Are you sure you want to delete this food item?")) {
      return;
    }

    try {
      setSuccessMessage("");
      setErrorMessage("");
      await api.delete(`/food/${foodId}`);
      setSuccessMessage("Food item deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("Error deleting food:", error);
      setErrorMessage("Failed to delete food item");
    }
  };

  const handleUpdateComplaintStatus = async (complaintId, status) => {
    try {
      setSuccessMessage("");
      setErrorMessage("");
      await api.put(`/complaints/${complaintId}/status`, { status });
      setSuccessMessage("Complaint status updated successfully!");
      fetchData();
    } catch (error) {
      console.error("Error updating complaint:", error);
      setErrorMessage("Failed to update complaint status");
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      setSuccessMessage("");
      setErrorMessage("");
      await api.put(`/orders/${orderId}/status`, { status });
      setSuccessMessage("Order status updated successfully!");
      fetchData();
    } catch (error) {
      console.error("Error updating order:", error);
      setErrorMessage("Failed to update order status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-midnight text-xl">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <h1 className="text-4xl font-heading text-midnight mb-2">
          Admin <span className="text-gold">Dashboard</span>
        </h1>
        <p className="text-midnight opacity-70 mb-8">
          Welcome back, {user?.email}
        </p>

        {successMessage && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {errorMessage}
          </div>
        )}

        {/* ===================== DASHBOARD STATS ===================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">

          <div className="bg-white p-8 rounded-xl shadow-md">
            <h3 className="text-xl font-heading text-midnight">
              Total Orders
            </h3>
            <p className="text-3xl font-bold text-gold mt-4">
              {orders.length}
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md">
            <h3 className="text-xl font-heading text-midnight">
              Total Complaints
            </h3>
            <p className="text-3xl font-bold text-gold mt-4">
              {complaints.length}
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md">
            <h3 className="text-xl font-heading text-midnight">
              Pending Complaints
            </h3>
            <p className="text-3xl font-bold text-gold mt-4">
              {complaints.filter(c => c.status === "Open").length}
            </p>
          </div>

        </div>

        {/* ===================== ADD FOOD SECTION ===================== */}
        <div className="bg-white p-8 rounded-xl shadow-md mb-12">

          <h2 className="text-2xl font-heading text-midnight mb-6">
            Add New Food Item
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <input
              placeholder="Food Name"
              value={newFood.name}
              className="p-2 border rounded focus:ring-2 focus:ring-gold"
              onChange={(e) =>
                setNewFood({ ...newFood, name: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Price (₹)"
              value={newFood.price}
              className="p-2 border rounded focus:ring-2 focus:ring-gold"
              onChange={(e) =>
                setNewFood({ ...newFood, price: e.target.value })
              }
            />

            <input
              placeholder="Category (Breakfast/Lunch/Dinner)"
              value={newFood.category}
              className="p-2 border rounded focus:ring-2 focus:ring-gold"
              onChange={(e) =>
                setNewFood({ ...newFood, category: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Calories"
              value={newFood.calories}
              className="p-2 border rounded focus:ring-2 focus:ring-gold"
              onChange={(e) =>
                setNewFood({ ...newFood, calories: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Protein (g)"
              value={newFood.protein}
              className="p-2 border rounded focus:ring-2 focus:ring-gold"
              onChange={(e) =>
                setNewFood({ ...newFood, protein: e.target.value })
              }
            />

            <select
              className="p-2 border rounded focus:ring-2 focus:ring-gold"
              value={newFood.veg}
              onChange={(e) =>
                setNewFood({
                  ...newFood,
                  veg: e.target.value === "true",
                })
              }
            >
              <option value="true">Veg</option>
              <option value="false">Non-Veg</option>
            </select>

            <div className="md:col-span-3">
              <input
                placeholder="Image URL (optional)"
                value={newFood.image}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-gold"
                onChange={(e) =>
                  setNewFood({ ...newFood, image: e.target.value })
                }
              />
            </div>

          </div>

          <button
            onClick={handleAddFood}
            className="mt-6 bg-gold text-midnight px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Add Food Item
          </button>

        </div>

        {/* ===================== MANAGE FOOD SECTION ===================== */}
        <div className="bg-white p-8 rounded-xl shadow-md mb-12">

          <h2 className="text-2xl font-heading text-midnight mb-6">
            Manage Food Items ({foods.length})
          </h2>

          {foods.length === 0 ? (
            <p className="text-midnight opacity-70">No food items available.</p>
          ) : (
            <div className="space-y-4">
              {foods.map((food) => (
                <div
                  key={food._id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition"
                >
                  <img
                    src={food.image || "https://via.placeholder.com/80"}
                    alt={food.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-midnight">{food.name}</p>
                    <p className="text-sm text-midnight opacity-70">
                      ₹{food.price} | {food.category} | {food.calories} kcal | {food.protein}g protein | {food.veg ? "Veg" : "Non-Veg"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteFood(food._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* ===================== ORDERS SECTION ===================== */}
        <div className="bg-white p-8 rounded-xl shadow-md mb-12">

          <h2 className="text-2xl font-heading text-midnight mb-6">
            All Orders ({orders.length})
          </h2>

          {orders.length === 0 ? (
            <p className="text-midnight opacity-70">No orders yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="border rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-sm text-midnight opacity-70">
                        {order.userId?.name} ({order.userId?.email})
                      </p>
                      <p className="text-sm text-midnight opacity-70">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gold">
                        ₹{order.totalAmount}
                      </p>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        className="mt-2 p-2 border rounded text-sm"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-midnight opacity-70">
                    Items: {order.items.map(item => 
                      `${item.foodId?.name || 'Item'} × ${item.quantity}`
                    ).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* ===================== COMPLAINTS SECTION ===================== */}
        <div className="bg-white p-8 rounded-xl shadow-md">

          <h2 className="text-2xl font-heading text-midnight mb-6">
            Complaints Management ({complaints.length})
          </h2>

          {complaints.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow-md">
              <p className="text-midnight opacity-70">No complaints submitted.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div
                  key={complaint._id}
                  className="border rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">
                        Order #{complaint.orderId?._id?.slice(-6).toUpperCase() || 'N/A'}
                      </p>
                      <p className="text-sm text-midnight opacity-70">
                        {complaint.userId?.name} ({complaint.userId?.email})
                      </p>
                      <p className="text-sm text-midnight opacity-70">
                        {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          complaint.status === "Resolved"
                            ? "bg-green-100 text-green-700"
                            : complaint.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {complaint.status}
                      </span>
                      <div className="mt-2">
                        <select
                          value={complaint.status}
                          onChange={(e) => handleUpdateComplaintStatus(complaint._id, e.target.value)}
                          className="p-2 border rounded text-sm"
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-midnight">{complaint.message}</p>
                  {complaint.adminResponse && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-semibold text-midnight">Admin Response:</p>
                      <p className="text-sm text-midnight opacity-80">{complaint.adminResponse}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default Admin;