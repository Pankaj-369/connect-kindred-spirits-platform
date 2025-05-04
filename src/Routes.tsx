
import { Routes as RouterRoutes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<NotFound />} />
    </RouterRoutes>
  );
};

export default Routes;
