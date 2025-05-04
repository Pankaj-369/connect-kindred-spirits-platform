
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Bell, Heart, Menu, Search, User, X, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-x-4">
            <Link to="/" className="flex items-center gap-2">
              <img src="/lovable-uploads/e50da375-04f7-4f40-ada5-e998253eaa83.png" alt="Connect4Good Logo" className="w-10 h-10" />
              <span className="text-xl font-display font-bold text-connect-dark">Connect<span className="text-connect-primary">4</span>Good</span>
            </Link>
            
            <div className="hidden md:flex items-center ml-8 space-x-6">
              <Link to="/" className="text-connect-dark hover:text-connect-primary transition-colors font-medium">Home</Link>
              <Link to="/opportunities" className="text-connect-dark hover:text-connect-primary transition-colors font-medium">Opportunities</Link>
              <Link to="/ngo-list" className="text-connect-dark hover:text-connect-primary transition-colors font-medium">NGO List</Link>
              <Link to="/campaigns" className="text-connect-dark hover:text-connect-primary transition-colors font-medium">Campaigns</Link>
              <Link to="/about" className="text-connect-dark hover:text-connect-primary transition-colors font-medium">About</Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input 
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-connect-primary/20 w-[180px]"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-connect-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </Button>
            
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/profile">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback>{profile?.username?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium hidden lg:inline">
                      {profile?.is_ngo ? profile.ngo_name : profile?.full_name || profile?.username || "Profile"}
                    </span>
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" className="font-medium">Login</Button>
                </Link>
                
                <Link to="/auth">
                  <Button className="bg-connect-primary hover:bg-connect-primary/90 text-white font-medium">Join Us</Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t p-4 animate-fade-in">
          <div className="flex flex-col space-y-3">
            <Link to="/" className="px-2 py-1 hover:bg-gray-100 rounded-md">Home</Link>
            <Link to="/opportunities" className="px-2 py-1 hover:bg-gray-100 rounded-md">Opportunities</Link>
            <Link to="/ngo-list" className="px-2 py-1 hover:bg-gray-100 rounded-md">NGO List</Link>
            <Link to="/campaigns" className="px-2 py-1 hover:bg-gray-100 rounded-md">Campaigns</Link>
            <Link to="/about" className="px-2 py-1 hover:bg-gray-100 rounded-md">About</Link>
            
            <div className="pt-2 border-t border-gray-200">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="flex items-center px-2 py-1 hover:bg-gray-100 rounded-md">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback>{profile?.username?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <span>Profile</span>
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="w-full mt-2 flex items-center px-2 py-1 hover:bg-gray-100 rounded-md"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="flex space-x-2">
                  <Link to="/auth" className="flex-1">
                    <Button variant="outline" className="w-full font-medium">Login</Button>
                  </Link>
                  <Link to="/auth" className="flex-1">
                    <Button className="w-full font-medium bg-connect-primary">Join Us</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
