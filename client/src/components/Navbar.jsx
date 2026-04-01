import { NavLink } from "react-router-dom";
import { useState, useContext } from "react";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

function Navbar() {

  const [open, setOpen] = useState(false);

  const { cartItems } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <nav className="bg-midnight text-cream px-6 md:px-10 py-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">

        {/* Logo */}
        <h1 className="text-2xl font-heading tracking-wide">
          <span className="text-gold">Foodie</span>Web
        </h1>

        {/* Center Links */}
        <div className="hidden md:flex gap-10 text-lg items-center">

          <NavLink to="/" className="hover:text-gold transition">
            Home
          </NavLink>

          <NavLink to="/menu" className="hover:text-gold transition">
            Menu
          </NavLink>

          <NavLink to="/group" className="hover:text-gold transition">
            Group Order
          </NavLink>

          {user?.role === "admin" && (
            <NavLink to="/admin" className="hover:text-gold transition">
              Admin
            </NavLink>
          )}

        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-6">

          {/* Cart */}
          <NavLink
            to="/cart"
            className="relative text-xl hover:text-gold transition"
          >
            <FaShoppingCart />

            {totalItems > 0 && (
              <span className="absolute -top-2 -right-3 bg-gold text-midnight text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </NavLink>

          {/* Profile */}
          <div className="relative">

            <button
              onClick={() => setOpen(!open)}
              className="text-xl hover:text-gold transition"
            >
              <FaUserCircle />
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-52 bg-white text-midnight rounded-xl shadow-xl p-5 space-y-3">

                {user ? (
                  <>
                    <p className="font-semibold">{user.email}</p>

                    <hr />
                    <NavLink
  to="/orders"
  className="block w-full text-left hover:text-gold"
>
  My Orders
</NavLink>

                    <button
                      onClick={logout}
                      className="block w-full text-left hover:text-red-500"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <NavLink
                    to="/login"
                    className="block w-full text-left hover:text-gold"
                  >
                    Login
                  </NavLink>
                )}

              </div>
            )}

          </div>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;