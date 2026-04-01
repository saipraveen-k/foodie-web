import { useState, useEffect, useContext } from "react";
import api from "../utils/axiosSetup";
import { CartContext } from "../context/CartContext";

function Menu() {
  const { addToCart } = useContext(CartContext);

  const categories = [
    "All",
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snacks",
    "Desserts",
    "Beverages",
  ];

  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filterType, setFilterType] = useState("");
  const [maxCalories, setMaxCalories] = useState(600);
  const [minProtein, setMinProtein] = useState(0);
  const [sortOption, setSortOption] = useState("");
  const [quantities, setQuantities] = useState({});

  // 🔥 Fetch foods from backend
  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const res = await api.get("/food");
      if (res.data.foods) {
        setFoods(res.data.foods);
      }
    } catch (error) {
      console.error("Error fetching foods:", error);
    }
  };

  // 🔥 Filtering Logic
  let filteredFoods = foods.filter((food) => {
    return (
      food.name.toLowerCase().includes(search.toLowerCase()) &&
      (selectedCategory === "All"
        ? true
        : food.category === selectedCategory) &&
      (filterType
        ? (food.veg ? "Veg" : "Non-Veg") === filterType
        : true) &&
      food.calories <= maxCalories &&
      food.protein >= minProtein
    );
  });

  // 🔥 Sorting
  if (sortOption === "priceHigh") {
    filteredFoods.sort((a, b) => b.price - a.price);
  }

  const increase = (food) => {
    setQuantities((prev) => ({
      ...prev,
      [food._id]: (prev[food._id] || 0) + 1,
    }));
    addToCart(food);
  };

  const decrease = (food) => {
    setQuantities((prev) => ({
      ...prev,
      [food._id]:
        prev[food._id] > 0 ? prev[food._id] - 1 : 0,
    }));
  };

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto px-10 py-12">

        <h1 className="text-4xl font-heading text-midnight mb-6">
          Explore Our <span className="text-gold">Menu</span>
        </h1>

        {/* Search + Sort */}
        <div className="flex justify-between items-center gap-6 mb-6">
          <input
            type="text"
            placeholder="Search dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-midnight rounded-lg px-4 py-2 w-1/2 focus:ring-2 focus:ring-gold"
          />

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border border-midnight rounded-lg px-4 py-2 focus:ring-2 focus:ring-gold"
          >
            <option value="">Sort By</option>
            <option value="priceHigh">Price: High → Low</option>
          </select>
        </div>

        {/* Category Buttons */}
        <div className="flex gap-4 flex-wrap mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full border transition ${
                selectedCategory === cat
                  ? "bg-gold text-midnight border-gold"
                  : "border-midnight text-midnight hover:bg-midnight hover:text-cream"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Veg / Non-Veg Filter */}
        <div className="flex gap-4 mb-8">
          {["", "Veg", "Non-Veg"].map((type) => (
            <button
              key={type || "All"}
              onClick={() => setFilterType(type)}
              className={`px-5 py-2 rounded-lg border transition ${
                filterType === type
                  ? "bg-gold text-midnight border-gold"
                  : "border-midnight text-midnight hover:bg-midnight hover:text-cream"
              }`}
            >
              {type || "All"}
            </button>
          ))}
        </div>

        {/* Sliders */}
        <div className="bg-white p-8 rounded-xl shadow-md mb-10 space-y-6">

          <div>
            <div className="flex justify-between text-midnight font-medium">
              <span>Max Calories</span>
              <span>{maxCalories} kcal</span>
            </div>
            <input
              type="range"
              min="100"
              max="600"
              value={maxCalories}
              onChange={(e) => setMaxCalories(Number(e.target.value))}
              className="w-full accent-gold mt-2"
            />
          </div>

          <div>
            <div className="flex justify-between text-midnight font-medium">
              <span>Min Protein</span>
              <span>{minProtein} g</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={minProtein}
              onChange={(e) => setMinProtein(Number(e.target.value))}
              className="w-full accent-gold mt-2"
            />
          </div>

        </div>

        {/* Food Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredFoods.map((food) => {
            const qty = quantities[food._id] || 0;

            return (
              <div
                key={food._id}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition"
              >
                <img
                  src={food.image}
                  alt={food.name}
                  className="h-40 w-full object-cover rounded-lg mb-4"
                />

                <h2 className="text-xl font-heading text-midnight mb-2">
                  {food.name}
                </h2>

                <p className="text-midnight opacity-70 text-sm">
                  {food.category} | {food.veg ? "Veg" : "Non-Veg"}
                </p>

                <p className="text-midnight opacity-70 text-sm">
                  {food.calories} kcal • {food.protein}g protein
                </p>

                <div className="flex justify-between items-center mt-4">
                  <p className="text-gold font-bold text-lg">
                    ₹ {food.price}
                  </p>

                  {qty === 0 ? (
                    <button
                      onClick={() => increase(food)}
                      className="bg-gold text-midnight px-4 py-2 rounded-lg hover:opacity-90"
                    >
                      Add
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => decrease(food)}
                        className="bg-midnight text-cream px-3 py-1 rounded"
                      >
                        -
                      </button>

                      <span className="font-semibold text-midnight">
                        {qty}
                      </span>

                      <button
                        onClick={() => increase(food)}
                        className="bg-gold text-midnight px-3 py-1 rounded"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default Menu;