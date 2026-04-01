import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

function Cart() {
  const {
    cartItems,
    getTotalAmount,
    placeOrder
  } = useContext(CartContext);
  
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
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
      setAddress("");
      navigate("/orders");
    } catch (err) {
      console.error("Order placement error:", err);
      setError(err.message || "Error placing order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto px-10 py-12">

        <h1 className="text-4xl font-heading text-midnight mb-10">
          Your <span className="text-gold">Cart</span>
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow-md text-center">
            <p className="text-midnight opacity-70 text-lg">
              Your cart is empty.
            </p>
            <button
              onClick={() => navigate("/menu")}
              className="mt-4 bg-gold text-midnight px-6 py-2 rounded-lg font-semibold hover:opacity-90"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ITEMS */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image || "https://via.placeholder.com/80"}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h2 className="text-xl font-heading text-midnight">
                        {item.name}
                      </h2>
                      <p className="text-midnight opacity-70">
                        ₹ {item.price}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-midnight">
                      {item.quantity}
                    </span>
                    <p className="text-gold font-bold">
                      ₹ {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* SUMMARY */}
            <div className="bg-white p-8 rounded-xl shadow-md h-fit">

              <h2 className="text-2xl font-heading text-midnight mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹ {getTotalAmount().toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹ {deliveryFee.toFixed(2)}</span>
                </div>

                <hr />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-gold">₹ {total.toFixed(2)}</span>
                </div>

              </div>

              {/* ADDRESS INPUT */}
              <textarea
                placeholder="Enter delivery address (minimum 10 characters)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full mt-6 p-3 border rounded-lg focus:ring-2 focus:ring-gold"
                rows={3}
              />

              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className={`mt-6 w-full bg-gold text-midnight py-3 rounded-lg font-semibold transition ${
                  isPlacingOrder ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                }`}
              >
                {isPlacingOrder ? "Placing Order..." : "Place Order"}
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default Cart;