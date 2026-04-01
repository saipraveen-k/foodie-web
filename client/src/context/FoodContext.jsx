import { createContext, useState, useEffect } from "react";

export const FoodContext = createContext();

export function FoodProvider({ children }) {

  const defaultFoods = [
    {
      id: 1,
      name: "Grilled Chicken",
      price: 250,
      category: "Lunch",
      veg: false,
      calories: 400,
      protein: 35,
    },
    {
      id: 2,
      name: "Veg Salad Bowl",
      price: 180,
      category: "Lunch",
      veg: true,
      calories: 250,
      protein: 10,
    },
  ];

  const [foods, setFoods] = useState([]);

  useEffect(() => {
    const storedFoods = localStorage.getItem("foods");
    if (storedFoods) {
      setFoods(JSON.parse(storedFoods));
    } else {
      setFoods(defaultFoods);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("foods", JSON.stringify(foods));
  }, [foods]);

  const addFood = (food) => {
    setFoods([...foods, { ...food, id: Date.now() }]);
  };

  const deleteFood = (id) => {
    setFoods(foods.filter((f) => f.id !== id));
  };

  return (
    <FoodContext.Provider value={{ foods, addFood, deleteFood }}>
      {children}
    </FoodContext.Provider>
  );
}