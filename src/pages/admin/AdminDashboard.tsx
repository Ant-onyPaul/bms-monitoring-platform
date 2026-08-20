import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import { FiUsers, FiServer, FiActivity } from 'react-icons/fi';

import AlertCard from '../../components/AlertCard';

const MOCK_ALERTS = [
  { type: 'fault', message: 'Offline Device Detected: INV-02', time: '10 mins ago' },
  { type: 'warning', message: 'High temperature on Site Alpha', time: '1 hour ago' },
  { type: 'info', message: 'Firmware updated on 12 devices', time: '3 hours ago' },
];

const MOCK_ACTIVITY = [
  { user: 'Admin User', action: 'Approved vendor registration: Solartron', time: '1 hour ago' },
  { user: 'System', action: 'Automated backup completed', time: '5 hours ago' },
  { user: 'Tech Support', action: 'Resolved support ticket #1042', time: '1 day ago' },
  { user: 'Admin User', action: 'Created new device profile: BATT-X1', time: '2 days ago' },
];

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
        <div className="pb-2 border-b border-border">
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground mt-1">Welcome back, {profile?.full_name || 'Admin'}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Vendors" value={stats.totalVendors.toString()} icon={FiUsers} colorClass="bg-[#10B981]/10 text-[#10B981]" />
          <StatCard title="Total Customers" value={stats.totalCustomers.toString()} icon={FiUsers} colorClass="bg-[#10B981]/10 text-[#10B981]" />
          <StatCard title="Total Devices" value={stats.totalDevices.toString()} icon={FiServer} colorClass="bg-[#10B981]/10 text-[#10B981]" />
          <StatCard title="Online Devices" value={stats.onlineDevices.toString()} icon={FiActivity} colorClass="bg-[#10B981]/10 text-[#10B981] animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="premium-card p-6 h-full flex flex-col">
            <h3 className="label-technical mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
              Recent Activity
            </h3>
            <div className="space-y-3 flex-1 overflow-y-auto">
              {MOCK_ACTIVITY.map((activity, idx) => (
                <div key={idx} className="flex flex-col gap-1 p-3 rounded-md border border-border bg-card">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-foreground">{activity.user}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{activity.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.action}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="h-[400px]">
            <AlertCard alerts={MOCK_ALERTS} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
