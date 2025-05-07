
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Campaigns from './pages/Campaigns';
import NGOList from './pages/NGOList';
import Opportunities from './pages/Opportunities';
import About from './pages/About';

const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/login" element={<Navigate to="/auth" />} />
      <Route path="/register" element={<Navigate to="/auth" />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/campaigns" element={<Campaigns />} />
      <Route path="/ngo-list" element={<NGOList />} />
      <Route path="/opportunities" element={<Opportunities />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<NotFound />} />
    </RouterRoutes>
  );
};

export default Routes;
