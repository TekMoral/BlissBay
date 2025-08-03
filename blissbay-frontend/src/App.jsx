import Header from "./components/layout/Header";
import { useCart } from "./context/CartContext";
import { ToastContainer } from "react-toastify";
import { Outlet } from "react-router-dom";

import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const { cartItemCount } = useCart();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header cartItemCount={cartItemCount} />
      <main className="flex-1 pt-[54px]">
        <Outlet />
        <ToastContainer />
      </main>
    </div>
  );
};

export default App;