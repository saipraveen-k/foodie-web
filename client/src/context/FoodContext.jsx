import { createContext, useState, useEffect } from "react";
import api from "../utils/axiosSetup";

export const FoodContext = createContext();

export function FoodProvider({ children }) {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const res = await api.get("/food");
      if (res.data.foods) {
        setFoods(res.data.foods);
      }
    } catch (error) {
      console.error("Error fetching foods:", error);
    } finally {
      setLoading(false);
    }
  };

  const addFood = async (food) => {
    try {
      const res = await api.post("/food/add", food);
      if (res.data.food) {
        setFoods([...foods, res.data.food]);
      }
      return res.data;
    } catch (error) {
      console.error("Error adding food:", error);
      throw error;
    }
  };

  const deleteFood = async (foodId) => {
    try {
      await api.delete(`/food/${foodId}`);
      setFoods(foods.filter(f => f._id !== foodId));
    } catch (error) {
      console.error("Error deleting food:", error);
      throw error;
    }
  };

  const updateFood = async (foodId, updates) => {
    try {
      const res = await api.put(`/food/${foodId}`, updates);
      if (res.data.food) {
        setFoods(foods.map(f => f._id === foodId ? res.data.food : f));
      }
      return res.data;
    } catch (error) {
      console.error("Error updating food:", error);
      throw error;
    }
  };

  return (
    <FoodContext.Provider value={{ foods, loading, addFood, deleteFood, updateFood, fetchFoods }}>
      {children}
    </FoodContext.Provider>
  );
}