import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types/database.types';

interface RoleGuardProps {
  allowedRoles: Role[];
}

export default function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but no profile loaded or role not allowed
  if (!profile || !allowedRoles.includes(profile.role)) {
    // If they have a profile, send them to their own dashboard
    if (profile) {
      if (profile.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
      if (profile.role === 'vendor') return <Navigate to="/vendor/dashboard" replace />;
      if (profile.role === 'customer') return <Navigate to="/customer/dashboard" replace />;
    }
    
    // Otherwise fallback to login or an unauthorized page
    return <Navigate to="/login" replace />;
  }

  // Authorized
  return <Outlet />;
}
