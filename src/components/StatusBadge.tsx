import React from 'react';

interface StatusBadgeProps {
  lastSeenAt: string | null;
  status?: string; // e.g. 'maintenance', 'inactive'
}

export default function StatusBadge({ lastSeenAt, status }: StatusBadgeProps) {
  // If explicitly set to something else, show that
  if (status && status !== 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border">
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground"></span>
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
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest ${isOnline ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-[#10B981] animate-pulse' : 'bg-destructive'}`}></span>
      {isOnline ? 'Online' : 'Offline'}
    </span>
  );
}
