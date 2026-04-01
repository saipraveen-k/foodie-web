import { useState, useContext } from "react";
import { ComplaintContext } from "../context/ComplaintContext";
import { OrdersContext } from "../context/OrdersContext";
import { FoodContext } from "../context/FoodContext";

function Admin() {
  const { complaints, resolveComplaint } = useContext(ComplaintContext);
  const { orders } = useContext(OrdersContext);
  const { foods, addFood, deleteFood } = useContext(FoodContext);

  const [newFood, setNewFood] = useState({
    name: "",
    price: "",
    category: "",
    veg: true,
    calories: "",
    protein: "",
  });

  const handleAddFood = () => {
    if (
      !newFood.name ||
      !newFood.price ||
      !newFood.category ||
      !newFood.calories ||
      !newFood.protein
    ) {
      alert("Please fill all fields");
      return;
    }

    addFood({
      ...newFood,
      price: Number(newFood.price),
      calories: Number(newFood.calories),
      protein: Number(newFood.protein),
    });

    setNewFood({
      name: "",
      price: "",
      category: "",
      veg: true,
      calories: "",
      protein: "",
    });
  };

  return (
    <div className="min-h-screen bg-cream p-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <h1 className="text-4xl font-heading text-midnight mb-10">
          Admin <span className="text-gold">Dashboard</span>
        </h1>

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
              {complaints.filter(c => c.status === "Pending").length}
            </p>
          </div>

        </div>

        {/* ===================== ADD FOOD SECTION ===================== */}
        <div className="bg-white p-8 rounded-xl shadow-md mb-12">

          <h2 className="text-2xl font-heading text-midnight mb-6">
            Add New Food Item
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <input
              placeholder="Food Name"
              value={newFood.name}
              className="p-2 border rounded"
              onChange={(e) =>
                setNewFood({ ...newFood, name: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Price"
              value={newFood.price}
              className="p-2 border rounded"
              onChange={(e) =>
                setNewFood({ ...newFood, price: e.target.value })
              }
            />

            <input
              placeholder="Category (Breakfast/Lunch)"
              value={newFood.category}
              className="p-2 border rounded"
              onChange={(e) =>
                setNewFood({ ...newFood, category: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Calories"
              value={newFood.calories}
              className="p-2 border rounded"
              onChange={(e) =>
                setNewFood({ ...newFood, calories: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Protein (g)"
              value={newFood.protein}
              className="p-2 border rounded"
              onChange={(e) =>
                setNewFood({ ...newFood, protein: e.target.value })
              }
            />

            <select
              className="p-2 border rounded"
              value={newFood.veg}
              onChange={(e) =>
                setNewFood({
                  ...newFood,
                  veg: e.target.value === "true",
                })
              }
            >
              <option value="true">Veg</option>
              <option value="false">Non Veg</option>
            </select>

          </div>

          <button
            onClick={handleAddFood}
            className="mt-6 bg-gold text-midnight px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Add Food
          </button>

        </div>

        {/* ===================== MANAGE FOOD SECTION ===================== */}
        <div className="mb-12">

          <h2 className="text-2xl font-heading text-midnight mb-4">
            Manage Food Items
          </h2>

          {foods.length === 0 ? (
            <p>No food items available.</p>
          ) : (
            foods.map((food) => (
              <div
                key={food.id}
                className="bg-white p-4 rounded shadow mb-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{food.name}</p>
                  <p className="text-sm text-midnight opacity-70">
                    ₹ {food.price} | {food.category} | {food.veg ? "Veg" : "Non Veg"}
                  </p>
                </div>

                <button
                  onClick={() => deleteFood(food.id)}
                  className="bg-red-500 text-white px-4 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            ))
          )}

        </div>

        {/* ===================== COMPLAINTS SECTION ===================== */}
        <div>

          <h2 className="text-2xl font-heading text-midnight mb-6">
            Complaints Management
          </h2>

          {complaints.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow-md">
              <p>No complaints submitted.</p>
            </div>
          ) : (
            complaints.map((c) => (
              <div
                key={c.id}
                className="bg-white p-6 rounded-xl shadow-md mb-4"
              >
                <p><strong>User:</strong> {c.user}</p>
                <p className="text-sm opacity-70">{c.date}</p>
                <p className="my-2"><strong>Issue:</strong> {c.text}</p>

                <div className="flex justify-between items-center">
                  <span
                    className={`font-semibold ${
                      c.status === "Pending"
                        ? "text-red-500"
                        : "text-green-600"
                    }`}
                  >
                    {c.status}
                  </span>

                  {c.status === "Pending" && (
                    <button
                      onClick={() => resolveComplaint(c.id)}
                      className="bg-gold text-midnight px-4 py-2 rounded-lg"
                    >
                      Mark as Resolved
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

        </div>

      </div>
    </div>
  );
}

export default Admin;