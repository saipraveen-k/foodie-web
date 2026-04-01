import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import GroupOrder from "./pages/GroupOrder";
import Complaint from "./pages/Complaint";

function App() {
  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/group" element={<GroupOrder />} />
<Route path="/complaint" element={<Complaint />} />
      </Routes>
    </div>
  );
}

export default App;