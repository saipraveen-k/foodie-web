import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import axios from "axios";

function Cart() {

  const {
    cartItems,
    addToCart,
    decreaseFromCart,
    getTotalAmount,
    clearCart
  } = useContext(CartContext);

  const [address, setAddress] = useState("");

  const deliveryFee = cartItems.length > 0 ? 40 : 0;
  const total = getTotalAmount() + deliveryFee;

  const placeOrder = async () => {

    try {

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first.");
        return;
      }

      if (!address) {
        alert("Please enter delivery address");
        return;
      }

      const orderItems = cartItems.map(item => ({
        food: item._id || item.id,
        quantity: item.quantity
      }));

      await axios.post(
        "http://localhost:5000/api/orders/place",
        {
          items: orderItems,
          totalAmount: total,
          address: address
        },
        {
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      );

      alert("Order placed successfully 🎉");

      clearCart();
      setAddress("");

    } catch (error) {

      console.log(error);

      alert("Error placing order");
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
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ITEMS */}

            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item._id || item.id}
                  className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center"
                >
                  <div>
                    <h2 className="text-xl font-heading text-midnight">
                      {item.name}
                    </h2>
                    <p className="text-midnight opacity-70">
                      ₹ {item.price}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">

                    <button
                      onClick={() => decreaseFromCart(item)}
                      className="bg-midnight text-cream px-3 py-1 rounded"
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() => addToCart(item)}
                      className="bg-gold text-midnight px-3 py-1 rounded"
                    >
                      +
                    </button>

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
                  <span>₹ {getTotalAmount()}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹ {deliveryFee}</span>
                </div>

                <hr />

                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹ {total}</span>
                </div>

              </div>

              {/* ADDRESS INPUT */}

              <textarea
                placeholder="Enter delivery address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full mt-6 p-3 border rounded-lg"
              />

              <button
                onClick={placeOrder}
                className="mt-6 w-full bg-gold text-midnight py-3 rounded-lg font-semibold"
              >
                Place Order
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default Cart;