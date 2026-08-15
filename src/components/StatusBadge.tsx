import React from 'react';

interface StatusBadgeProps {
  lastSeenAt: string | null;
  status?: string; // e.g. 'maintenance', 'inactive'
}

export default function StatusBadge({ lastSeenAt, status }: StatusBadgeProps) {
  // If explicitly set to something else, show that
  if (status && status !== 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-700 text-slate-300">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }

  // Calculate online/offline based on lastSeenAt
  const thresholdMinutes = 5;
  const isOnline = lastSeenAt 
    ? (new Date().getTime() - new Date(lastSeenAt).getTime()) < (thresholdMinutes * 60 * 1000)
    : false;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${isOnline ? 'bg-brand-green/10 text-brand-green border border-brand-green/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-brand-green animate-pulse' : 'bg-red-500'}`}></span>
      {isOnline ? 'Online' : 'Offline'}
    </span>
  );
}
