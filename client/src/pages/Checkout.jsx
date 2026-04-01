import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { OrdersContext } from "../context/OrdersContext";
import { useNavigate } from "react-router-dom";

function Checkout() {
const { cartItems, getTotalAmount, clearCart } = useContext(CartContext);  const { addOrder } = useContext(OrdersContext);
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("COD");

  const handlePlaceOrder = () => {
    if (!address) {
      alert("Please enter address");
      return;
    }

    const newOrder = {
      id: Date.now(),
      items: cartItems,
      total: getTotalAmount(),
      address,
      payment,
      date: new Date().toLocaleString(),
    };

    addOrder(newOrder);
clearCart();    
navigate("/orders");
  };

  return (
    <div className="min-h-screen bg-cream p-10">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md">

        <h2 className="text-3xl font-heading text-midnight mb-6">
          Checkout
        </h2>

        <textarea
          placeholder="Enter Delivery Address"
          className="w-full mb-4 p-3 border rounded-lg"
          onChange={(e) => setAddress(e.target.value)}
        />

        <select
          className="w-full mb-6 p-3 border rounded-lg"
          onChange={(e) => setPayment(e.target.value)}
        >
          <option value="COD">Cash on Delivery</option>
          <option value="Card">Card Payment</option>
        </select>

        <div className="mb-6 font-bold text-lg">
          Total: ₹ {getTotalAmount()}
        </div>

        <button
          onClick={handlePlaceOrder}
          className="w-full bg-gold text-midnight py-3 rounded-lg font-semibold"
        >
          Place Order
        </button>

      </div>
    </div>
  );
}

export default Checkout;