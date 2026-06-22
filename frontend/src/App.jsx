import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import RoleProtectedRoute from './components/RoleProtectedRoute'
import { useAuth } from './context/AuthContext'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import POS from './pages/POS'
import Orders from './pages/Orders'
import Products from './pages/Products'
import Categories from './pages/Categories'
import Inventory from './pages/Inventory'
import Employees from './pages/Employees'
import Customers from './pages/Customers'
import Offers from './pages/Offers'
import Reports from './pages/Reports'
import Billing from './pages/Billing'
import Settings from './pages/Settings'
import Unauthorized from './pages/Unauthorized'

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Protected Routes wrapped in DashboardLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          <Route element={<RoleProtectedRoute allowedRoles={['admin', 'manager', 'cashier']} />}>
            <Route path="/orders" element={<Orders />} />
            <Route path="/customers" element={<Customers />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={['admin', 'cashier']} />}>
            <Route path="/billing" element={<Billing />} />
            <Route path="/pos" element={<POS />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={['admin', 'manager']} />}>
            <Route path="/products" element={<Products />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={['admin', 'manager', 'inventory_staff']} />}>
            <Route path="/inventory" element={<Inventory />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/employees" element={<Employees />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Route>
      
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
    </Routes>
  )
}

export default App
