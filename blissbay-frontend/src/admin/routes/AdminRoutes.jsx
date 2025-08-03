import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import Dashboard from '../pages/Dashboard';
import AddProduct from '../pages/AddProduct';
import EditProduct from '../pages/EditProduct';
import AddCategory from '../pages/AddCategory';
import EditCategory from '../pages/EditCategory';
import Orders from '../pages/Orders';
import OrderDetails from '../pages/OrderDetails';
import Users from '../pages/Users';
import UserDetails from '../pages/UserDetails';
import ProductList from '../components/ProductList';
import CategoryList from '../components/CategoryList';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products">
          <Route index element={<ProductList />} />
          <Route path="new" element={<AddProduct />} />
          <Route path="edit/:id" element={<EditProduct />} />
        </Route>
        <Route path="categories">
          <Route index element={<CategoryList />} />
          <Route path="new" element={<AddCategory />} />
          <Route path="edit/:id" element={<EditCategory />} />
        </Route>
        <Route path="orders">
          <Route index element={<Orders />} />
          <Route path=":id" element={<OrderDetails />} />
        </Route>
        <Route path="users">
          <Route index element={<Users />} />
          <Route path=":id" element={<UserDetails />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;