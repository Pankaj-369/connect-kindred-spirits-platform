
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

type NavLinkItem = {
  path: string;
  label: string;
  requiresAuth?: boolean;
  requiresRole?: 'ngo' | 'volunteer';
};

// Define all possible navigation links
const allNavLinks: NavLinkItem[] = [
  { path: '/about', label: 'About' },
  { path: '/opportunities', label: 'Opportunities' },
  { path: '/campaigns', label: 'Manage Campaigns', requiresAuth: true, requiresRole: 'ngo' },
  { path: '/ngo-list', label: 'NGOs' },
  { path: '/volunteer-management', label: 'Volunteers', requiresAuth: true, requiresRole: 'ngo' },
  { path: '/dashboard', label: 'Dashboard', requiresAuth: true },
];

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, signOut, profile } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Filter links based on auth status and user role
  const navLinks = allNavLinks.filter(link => {
    // Public links
    if (!link.requiresAuth) return true;
    
    // Auth required but user not authenticated
    if (link.requiresAuth && !isAuthenticated) return false;
    
    // Role-specific links
    if (link.requiresRole) {
      const isNGO = profile?.is_ngo === true;
      if (link.requiresRole === 'ngo' && !isNGO) return false;
      if (link.requiresRole === 'volunteer' && isNGO) return false;
    }
    
    return true;
  });

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <NavLink to="/" className="flex items-center">
              <span className="text-xl font-bold text-connect-primary">Connect4Good</span>
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-connect-primary text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    )
                  }
                  onClick={closeMenu}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Auth Buttons or User Menu */}
          <div className="hidden md:block">
            {!isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/auth')}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/auth?tab=register')}
                >
                  Sign Up
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || 'User'} />
                      <AvatarFallback>{(profile?.full_name?.charAt(0) || 'U').toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    "block px-3 py-2 rounded-md text-base font-medium",
                    isActive
                      ? "bg-connect-primary text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  )
                }
                onClick={closeMenu}
              >
                {link.label}
              </NavLink>
            ))}
            
            {!isAuthenticated ? (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <Button
                  variant="outline"
                  className="w-full mb-2"
                  onClick={() => {
                    navigate('/auth');
                    closeMenu();
                  }}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button
                  className="w-full"
                  onClick={() => {
                    navigate('/auth?tab=register');
                    closeMenu();
                  }}
                >
                  Sign Up
                </Button>
              </div>
            ) : (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-3">
                  <div className="flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || 'User'} />
                      <AvatarFallback>{(profile?.full_name?.charAt(0) || 'U').toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">{profile?.full_name || 'User'}</div>
                    <div className="text-sm font-medium text-gray-500">
                      {profile?.is_ngo ? 'NGO Account' : 'Volunteer Account'}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/profile');
                      closeMenu();
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/dashboard');
                      closeMenu();
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      handleSignOut();
                      closeMenu();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
