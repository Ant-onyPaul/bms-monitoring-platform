import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import { FiUsers, FiServer, FiActivity } from 'react-icons/fi';

export default function VendorDashboard() {
  const { profile } = useAuth();
  
  // Mock data for Vendor Dashboard
  const stats = {
    totalCustomers: 15,
    totalDevices: 420,
    onlineDevices: 405,
    offlineDevices: 15,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-slide-up-fade">
        <div className="pb-2 border-b border-slate-700/50">
          <h2 className="text-3xl font-bold text-white tracking-tight">Vendor Dashboard</h2>
          <p className="text-slate-400 mt-1">Welcome back, {profile?.full_name}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Customers" value={stats.totalCustomers.toString()} icon={FiUsers} colorClass="bg-blue-500/10 text-blue-500" />
          <StatCard title="Total Devices" value={stats.totalDevices.toString()} icon={FiServer} colorClass="bg-brand-blue/10 text-brand-blue" />
          <StatCard title="Online Devices" value={stats.onlineDevices.toString()} icon={FiActivity} colorClass="bg-brand-green/10 text-brand-green" />
          <StatCard title="Offline Devices" value={stats.offlineDevices.toString()} icon={FiActivity} colorClass="bg-red-500/10 text-red-500" />
        </div>
      </div>
    </DashboardLayout>
  );
}
