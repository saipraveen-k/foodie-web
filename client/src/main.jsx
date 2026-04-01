import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { OrdersProvider } from "./context/OrdersContext";
import { GroupProvider } from "./context/GroupContext";
import { ComplaintProvider } from "./context/ComplaintContext";
import { FoodProvider } from "./context/FoodContext";
import App from "./App";
import "./index.css";

// Import axios setup to register interceptors
import "./utils/axiosSetup";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <ComplaintProvider>
        <OrdersProvider>
          <GroupProvider>
            <FoodProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </FoodProvider>
          </GroupProvider>
        </OrdersProvider>
      </ComplaintProvider>
    </AuthProvider>
  </BrowserRouter>
);