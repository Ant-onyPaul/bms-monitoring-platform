import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types/database.types';
import Logo from './Logo';

interface RoleGuardProps {
  allowedRoles: Role[];
}

export default function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-6">
        <Logo size={32} />
        {/* Indeterminate rail — honest about not knowing how long auth will take */}
        <div className="relative w-40 h-[3px] rounded-full bg-surface-3 overflow-hidden">
          <span
            className="absolute inset-y-0 w-1/3 bg-brand rounded-full"
            style={{ animation: 'shimmer 1.2s var(--ease-precise) infinite' }}
          />
        </div>
        <p className="label-technical">Verifying session</p>
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
