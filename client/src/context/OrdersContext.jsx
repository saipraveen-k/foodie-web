import { createContext, useState, useEffect, useContext } from "react";
import api from "../utils/axiosSetup";
import { AuthContext } from "./AuthContext";

export const OrdersContext = createContext();

export function OrdersProvider({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders/my-orders");
      if (res.data.orders) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const addOrder = (order) => {
    setOrders([order, ...orders]);
  };

  return (
    <OrdersContext.Provider value={{ orders, loading, addOrder, fetchOrders }}>
      {children}
    </OrdersContext.Provider>
  );
}