import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const { cartItems, getTotalAmount, placeOrder } = useContext(CartContext);
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("COD");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  const deliveryFee = cartItems.length > 0 ? 40 : 0;
  const total = getTotalAmount() + deliveryFee;

  const handlePlaceOrder = async () => {
    setError("");

    if (!address || address.trim().length < 10) {
      setError("Please enter a valid delivery address (minimum 10 characters)");
      return;
    }

    try {
      setIsPlacingOrder(true);
      await placeOrder(address);
      alert("Order placed successfully! 🎉");
      navigate("/orders");
    } catch (err) {
      console.error("Order placement error:", err);
      setError(err.message || "Error placing order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-cream p-10">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md text-center">
          <h2 className="text-3xl font-heading text-midnight mb-6">
            Checkout
          </h2>
          <p className="text-midnight opacity-70 mb-6">
            Your cart is empty. Add some items before checkout.
          </p>
          <button
            onClick={() => navigate("/menu")}
            className="bg-gold text-midnight px-6 py-2 rounded-lg font-semibold hover:opacity-90"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-10">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md">

        <h2 className="text-3xl font-heading text-midnight mb-6">
          Checkout
        </h2>

        <div className="mb-6">
          <h3 className="font-semibold text-midnight mb-3">Order Summary</h3>
          <div className="space-y-2">
            {cartItems.map((item) => (
              <div key={item._id} className="flex justify-between text-midnight">
                <span>{item.name} × {item.quantity}</span>
                <span>₹ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <hr className="my-4" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-gold">₹ {total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-midnight font-semibold mb-2">
            Delivery Address
          </label>
          <textarea
            placeholder="Enter your delivery address"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-gold"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-midnight font-semibold mb-2">
            Payment Method
          </label>
          <select
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-gold"
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
          >
            <option value="COD">Cash on Delivery</option>
            <option value="Card">Card Payment</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder}
          className={`w-full bg-gold text-midnight py-3 rounded-lg font-semibold transition ${
            isPlacingOrder ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
          }`}
        >
          {isPlacingOrder ? "Placing Order..." : "Place Order"}
        </button>

      </div>
    </div>
  );
}

export default Checkout;