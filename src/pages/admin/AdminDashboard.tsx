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
        <div className="pb-2 border-b border-slate-200">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h2>
          <p className="text-slate-600 mt-1">Welcome back, {profile?.full_name}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Vendors" value={stats.totalVendors.toString()} icon={FiUsers} colorClass="bg-brand-green/10 text-brand-green" />
          <StatCard title="Total Customers" value={stats.totalCustomers.toString()} icon={FiUsers} colorClass="bg-brand-green/10 text-brand-green" />
          <StatCard title="Total Devices" value={stats.totalDevices.toString()} icon={FiServer} colorClass="bg-brand-green/10 text-brand-green" />
          <StatCard title="Online Devices" value={stats.onlineDevices.toString()} icon={FiActivity} colorClass="bg-brand-green/10 text-brand-green animate-pulse-glow" />
        </div>

        {/* Placeholder for future sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-brand-green uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
              Recent Activity
            </h3>
            <p className="text-sm text-slate-600 mt-2">Activity logs will appear here.</p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-brand-green uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
              System Alerts
            </h3>
            <p className="text-sm text-slate-600 mt-2">System level alerts will appear here.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
