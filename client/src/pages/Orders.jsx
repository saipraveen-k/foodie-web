import { useEffect, useState } from "react";
import axios from "axios";

function Orders() {

  const [orders, setOrders] = useState([]);

  useEffect(() => {

    const fetchOrders = async () => {

      try {

        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/api/orders/my-orders",
          {
            headers: {
              authorization: `Bearer ${token}`
            }
          }
        );

        setOrders(res.data);

      } catch (error) {
        console.log(error);
      }

    };

    fetchOrders();

  }, []);

  return (
    <div className="max-w-5xl mx-auto p-10">

      <h1 className="text-3xl mb-6 font-bold">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        orders.map(order => (

          <div
            key={order._id}
            className="bg-white p-6 rounded-lg shadow mb-6"
          >

            <p className="font-semibold">
              Total: ₹{order.totalAmount}
            </p>

            <p className="text-gray-600">
              Items:
            </p>

            <ul className="list-disc ml-6">
              {order.items.map((item, index) => (
                <li key={index}>
                  {item.food?.name} × {item.quantity}
                </li>
              ))}
            </ul>

          </div>

        ))
      )}

    </div>
  );

}

export default Orders;