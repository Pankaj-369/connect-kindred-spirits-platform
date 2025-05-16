
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Campaigns from './pages/Campaigns';
import NGOList from './pages/NGOList';
import NGODetail from './pages/NGODetail';
import VolunteerManagement from './pages/VolunteerManagement';
import Opportunities from './pages/Opportunities';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import AuthGuard from './components/AuthGuard';
import PublicGuard from './components/PublicGuard';
import Layout from './components/Layout';

const Routes = () => {
  return (
    <RouterRoutes>
      <Route element={<Layout />}>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/ngo-list" element={<NGOList />} />
        <Route path="/ngo/:id" element={<NGODetail />} />
        
        {/* Auth routes - redirect if already logged in */}
        <Route path="/auth" element={
          <PublicGuard>
            <Auth />
          </PublicGuard>
        } />
        <Route path="/login" element={<Navigate to="/auth" />} />
        <Route path="/register" element={<Navigate to="/auth?tab=register" />} />
        
        {/* Protected routes - require authentication */}
        <Route path="/profile" element={
          <AuthGuard>
            <Profile />
          </AuthGuard>
        } />
        <Route path="/dashboard" element={
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        } />
        <Route path="/campaigns" element={
          <AuthGuard>
            <Campaigns />
          </AuthGuard>
        } />
        <Route path="/volunteer-management" element={
          <AuthGuard allowedRoles={['ngo']}>
            <VolunteerManagement />
          </AuthGuard>
        } />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </RouterRoutes>
  );
};

export default Routes;
