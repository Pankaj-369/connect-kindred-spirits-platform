
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: ('ngo' | 'volunteer')[];
}

const AuthGuard = ({ children, allowedRoles }: AuthGuardProps) => {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const location = useLocation();

  // Show loading state while auth status is being determined
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-connect-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has required role
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = profile?.is_ngo ? 'ngo' : 'volunteer';
    if (!allowedRoles.includes(userRole)) {
      // Redirect unauthorized users to dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }

  // User is authenticated and authorized
  return <>{children}</>;
};

export default AuthGuard;
