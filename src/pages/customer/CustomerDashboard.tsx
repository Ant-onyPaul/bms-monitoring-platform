import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import { FiServer, FiActivity } from 'react-icons/fi';

export default function CustomerDashboard() {
  const { profile } = useAuth();
  
  // Mock data for Customer Dashboard
  const stats = {
    totalDevices: 12,
    onlineDevices: 11,
    offlineDevices: 1,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-slide-up-fade">
        <div className="pb-2 border-b border-slate-700/50">
          <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard</h2>
          <p className="text-slate-400 mt-1">Welcome back, {profile?.full_name}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="My Devices" value={stats.totalDevices.toString()} icon={FiServer} colorClass="bg-brand-blue/10 text-brand-blue" />
          <StatCard title="Online" value={stats.onlineDevices.toString()} icon={FiActivity} colorClass="bg-brand-green/10 text-brand-green" />
          <StatCard title="Offline" value={stats.offlineDevices.toString()} icon={FiActivity} colorClass="bg-red-500/10 text-red-500" />
        </div>
      </div>
    </DashboardLayout>
  );
}
