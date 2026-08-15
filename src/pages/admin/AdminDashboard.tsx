import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import { FiUsers, FiServer, FiActivity } from 'react-icons/fi';

export default function AdminDashboard() {
  const { profile } = useAuth();
  
  // Mock data for Admin Dashboard
  const stats = {
    totalVendors: 12,
    totalCustomers: 45,
    totalDevices: 1240,
    onlineDevices: 1198,
    offlineDevices: 42,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-slide-up-fade">
        <div className="pb-2 border-b border-slate-700/50">
          <h2 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h2>
          <p className="text-slate-400 mt-1">Welcome back, {profile?.full_name}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Vendors" value={stats.totalVendors.toString()} icon={FiUsers} colorClass="bg-purple-500/10 text-purple-500" />
          <StatCard title="Total Customers" value={stats.totalCustomers.toString()} icon={FiUsers} colorClass="bg-blue-500/10 text-blue-500" />
          <StatCard title="Total Devices" value={stats.totalDevices.toString()} icon={FiServer} colorClass="bg-brand-blue/10 text-brand-blue" />
          <StatCard title="Online Devices" value={stats.onlineDevices.toString()} icon={FiActivity} colorClass="bg-brand-green/10 text-brand-green" />
        </div>

        {/* Placeholder for future sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
            <p className="text-sm text-slate-400">Activity logs will appear here.</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-medium text-white mb-4">System Alerts</h3>
            <p className="text-sm text-slate-400">System level alerts will appear here.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
