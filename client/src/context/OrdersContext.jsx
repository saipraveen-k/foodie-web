import { createContext, useState, useEffect } from "react";

export const OrdersContext = createContext();

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const storedOrders = localStorage.getItem("orders");
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  const addOrder = (order) => {
    setOrders([...orders, order]);
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder }}>
      {children}
    </OrdersContext.Provider>
  );
}