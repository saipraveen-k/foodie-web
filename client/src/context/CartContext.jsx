import { createContext, useState, useEffect, useContext } from "react";
import api from "../utils/axiosSetup";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch cart from backend when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get("/cart");
      if (res.data.cart && res.data.cart.items) {
        // Transform backend cart items to frontend format
        const items = res.data.cart.items.map(item => ({
          _id: item.foodId._id,
          name: item.foodId.name,
          price: item.foodId.price,
          image: item.foodId.image,
          quantity: item.quantity
        }));
        setCartItems(items);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item) => {
    // Optimistic update
    setCartItems((prev) => {
      const existing = prev.find((i) => i._id === item._id);
      if (existing) {
        return prev.map((i) =>
          i._id === item._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });

    // Sync with backend if authenticated
    if (isAuthenticated) {
      try {
        await api.post("/cart/add", {
          foodId: item._id,
          quantity: 1
        });
      } catch (error) {
        console.error("Error adding to cart:", error);
        // Revert on failure
        fetchCart();
      }
    }
  };

  const decreaseFromCart = async (item) => {
    // Optimistic update
    setCartItems((prev) => {
      const existing = prev.find((i) => i._id === item._id);
      if (!existing) return prev;

      if (existing.quantity === 1) {
        return prev.filter((i) => i._id !== item._id);
      }

      return prev.map((i) =>
        i._id === item._id
          ? { ...i, quantity: i.quantity - 1 }
          : i
      );
    });

    // Sync with backend if authenticated
    if (isAuthenticated) {
      try {
        if (item.quantity <= 1) {
          // Remove item
          await api.delete(`/cart/remove/${item._id}`);
        } else {
          // Update quantity
          await api.put("/cart/update", {
            foodId: item._id,
            quantity: item.quantity - 1
          });
        }
      } catch (error) {
        console.error("Error updating cart:", error);
        fetchCart();
      }
    }
  };

  const removeFromCart = async (item) => {
    // Optimistic update
    setCartItems((prev) => prev.filter((i) => i._id !== item._id));

    // Sync with backend if authenticated
    if (isAuthenticated) {
      try {
        await api.delete(`/cart/remove/${item._id}`);
      } catch (error) {
        console.error("Error removing from cart:", error);
        fetchCart();
      }
    }
  };

  const updateCartQuantity = async (item, quantity) => {
    if (quantity < 1) {
      removeFromCart(item);
      return;
    }

    // Optimistic update
    setCartItems((prev) =>
      prev.map((i) =>
        i._id === item._id ? { ...i, quantity } : i
      )
    );

    // Sync with backend if authenticated
    if (isAuthenticated) {
      try {
        await api.put("/cart/update", {
          foodId: item._id,
          quantity
        });
      } catch (error) {
        console.error("Error updating cart quantity:", error);
        fetchCart();
      }
    }
  };

  const getTotalAmount = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
  };

  const clearCart = () => {
    setCartItems([]);

    // Sync with backend if authenticated
    if (isAuthenticated) {
      api.delete("/cart/clear").catch(err => console.error("Error clearing cart:", err));
    }
  };

  const placeOrder = async (address) => {
    if (!isAuthenticated) {
      throw new Error("Please login to place an order");
    }

    if (!address || address.trim().length < 10) {
      throw new Error("Valid delivery address is required (minimum 10 characters)");
    }

    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    try {
      const orderItems = cartItems.map(item => ({
        foodId: item._id,
        quantity: item.quantity
      }));

      const res = await api.post("/orders/place", {
        items: orderItems,
        address: address.trim()
      });

      // Clear cart on success
      clearCart();

      return res.data;
    } catch (error) {
      console.error("Error placing order:", error);
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        decreaseFromCart,
        removeFromCart,
        updateCartQuantity,
        getTotalAmount,
        getTotalItems,
        clearCart,
        placeOrder,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}