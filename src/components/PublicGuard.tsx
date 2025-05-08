
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PublicGuardProps {
  children: ReactNode;
}

const PublicGuard = ({ children }: PublicGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while auth status is being determined
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-connect-primary"></div>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicGuard;
