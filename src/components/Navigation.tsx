import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogIn, LogOut, Home, Calendar, Users } from 'lucide-react';
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
import NotificationCenter from './NotificationCenter';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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

  // Determine user role
  const isNGO = profile?.is_ngo === true;
  const userRole = isNGO ? 'ngo' : 'volunteer';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <NavLink to="/" className="flex items-center">
              <span className="text-xl font-bold text-connect-primary">Connect4Good</span>
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Always visible links */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center",
                  isActive
                    ? "bg-connect-primary text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )
              }
              onClick={closeMenu}
            >
              <Home className="h-4 w-4 mr-1" />
              Home
            </NavLink>
            
            <NavLink
              to="/opportunities"
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
              Opportunities
            </NavLink>
            
            <NavLink
              to="/ai-matching"
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1",
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50"
                )
              }
              onClick={closeMenu}
            >
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-[10px] font-bold text-purple-700">
                ✨ AI
              </span>
              Smart Match
            </NavLink>
            
            <NavLink
              to="/ngo-list"
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
              NGOs
            </NavLink>
            
            <NavLink
              to="/about"
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
              About
            </NavLink>

            {/* Authenticated and role-specific links */}
            {isAuthenticated && (
              <>
                <NavLink
                  to="/campaigns"
                  className={({ isActive }) =>
                    cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center",
                      isActive
                        ? "bg-connect-primary text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    )
                  }
                  onClick={closeMenu}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Campaigns
                </NavLink>
                
                {isNGO && (
                  <NavLink
                    to="/volunteer-management"
                    className={({ isActive }) =>
                      cn(
                        "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center",
                        isActive
                          ? "bg-connect-primary text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      )
                    }
                    onClick={closeMenu}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Volunteers
                  </NavLink>
                )}
                
                <NavLink
                  to="/dashboard"
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
                  Dashboard
                </NavLink>
              </>
            )}
          </div>

          {/* Right Side Menu (Auth, Notifications & User Menu) */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Show notifications if authenticated */}
            {isAuthenticated && (
              <div className="mr-2">
                <NotificationCenter />
              </div>
            )}
            
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
          <div className="md:hidden flex items-center">
            {isAuthenticated && (
              <div className="mr-2">
                <NotificationCenter />
              </div>
            )}
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
            {/* Always include home link */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "block px-3 py-2 rounded-md text-base font-medium flex items-center",
                  isActive
                    ? "bg-connect-primary text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )
              }
              onClick={closeMenu}
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </NavLink>
            
            <NavLink
              to="/opportunities"
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
              Opportunities
            </NavLink>
            
            <NavLink
              to="/ai-matching"
              className={({ isActive }) =>
                cn(
                  "block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2",
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50"
                )
              }
              onClick={closeMenu}
            >
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-[10px] font-bold text-purple-700">
                ✨ AI
              </span>
              Smart Match
            </NavLink>
            
            <NavLink
              to="/ngo-list"
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
              NGOs
            </NavLink>
            
            <NavLink
              to="/about"
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
              About
            </NavLink>

            {/* Authenticated and role-specific links */}
            {isAuthenticated && (
              <>
                <NavLink
                  to="/campaigns"
                  className={({ isActive }) =>
                    cn(
                      "block px-3 py-2 rounded-md text-base font-medium flex items-center",
                      isActive
                        ? "bg-connect-primary text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    )
                  }
                  onClick={closeMenu}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Campaigns
                </NavLink>
                
                {isNGO && (
                  <NavLink
                    to="/volunteer-management"
                    className={({ isActive }) =>
                      cn(
                        "block px-3 py-2 rounded-md text-base font-medium flex items-center",
                        isActive
                          ? "bg-connect-primary text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      )
                    }
                    onClick={closeMenu}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Volunteers
                  </NavLink>
                )}
                
                <NavLink
                  to="/dashboard"
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
                  Dashboard
                </NavLink>
              </>
            )}
            
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
