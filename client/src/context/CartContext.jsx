import { createContext, useState } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => {
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
  };

  const decreaseFromCart = (item) => {
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
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        decreaseFromCart,
        getTotalAmount,
        getTotalItems,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}