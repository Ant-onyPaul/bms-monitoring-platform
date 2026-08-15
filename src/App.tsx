import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RoleGuard from './components/RoleGuard';

// Shared
import Login from './pages/Login'; // Wait, I will need to update Login.jsx to handle Supabase Auth
import DeviceDetails from './pages/shared/DeviceDetails';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import VendorManagement from './pages/admin/VendorManagement';
import AdminVendorDetails from './pages/admin/VendorDetails';
import CustomerManagement from './pages/admin/CustomerManagement';
import AdminCustomerDetails from './pages/admin/CustomerDetails';
import DeviceManagement from './pages/admin/DeviceManagement';

// Vendor
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorCustomers from './pages/vendor/VendorCustomers';
import VendorCustomerDetails from './pages/vendor/CustomerDetails';
import VendorDevices from './pages/vendor/VendorDevices';

// Customer
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerDevices from './pages/customer/CustomerDevices';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route element={<RoleGuard allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/vendors" element={<VendorManagement />} />
          <Route path="/admin/vendors/:id" element={<AdminVendorDetails />} />
          <Route path="/admin/customers" element={<CustomerManagement />} />
          <Route path="/admin/customers/:id" element={<AdminCustomerDetails />} />
          <Route path="/admin/devices" element={<DeviceManagement />} />
          <Route path="/admin/devices/:id" element={<DeviceDetails />} />
        </Route>

        {/* Vendor Routes */}
        <Route element={<RoleGuard allowedRoles={['vendor']} />}>
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/customers" element={<VendorCustomers />} />
          <Route path="/vendor/customers/:id" element={<VendorCustomerDetails />} />
          <Route path="/vendor/devices" element={<VendorDevices />} />
          <Route path="/vendor/devices/:id" element={<DeviceDetails />} />
        </Route>

        {/* Customer Routes */}
        <Route element={<RoleGuard allowedRoles={['customer']} />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/devices" element={<CustomerDevices />} />
          <Route path="/customer/devices/:id" element={<DeviceDetails />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
