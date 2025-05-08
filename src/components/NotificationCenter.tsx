
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Bell } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Interface for volunteer applications (used as notifications for NGOs)
interface VolunteerApplication {
  id: string;
  name: string;
  email: string;
  created_at: string;
  interest?: string;
  status: string;
  is_read?: boolean; // We'll track this in memory since the table doesn't have this column
}

const NotificationCenter: React.FC = () => {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<VolunteerApplication[]>([]);
  const [readStatus, setReadStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Get unread count based on our local read status tracking
  const unreadCount = notifications.filter(n => !readStatus[n.id]).length;

  useEffect(() => {
    if (!user || !profile) return;
    
    // Check if user is an NGO to fetch volunteer applications
    if (profile.is_ngo) {
      const fetchVolunteerApplications = async () => {
        try {
          const { data, error } = await supabase
            .from('volunteer_registrations')
            .select('*')
            .eq('ngo_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);
          
          if (error) throw error;

          // Initialize all as unread for first load
          const newReadStatus: Record<string, boolean> = {};
          data?.forEach(item => {
            newReadStatus[item.id] = false;
          });
          
          setReadStatus(prev => ({...prev, ...newReadStatus}));
          setNotifications(data || []);
        } catch (error) {
          console.error('Error fetching volunteer applications:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchVolunteerApplications();
      
      // Set up a subscription to listen for new volunteer applications
      const channel = supabase
        .channel('volunteer-applications')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'volunteer_registrations',
          filter: `ngo_id=eq.${user.id}` 
        }, (payload) => {
          setNotifications(prev => [payload.new as any, ...prev]);
          // Mark new notification as unread
          setReadStatus(prev => ({...prev, [payload.new.id]: false}));
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      // For volunteers, we don't have notifications yet
      setLoading(false);
    }
  }, [user, profile]);
  
  const markAsRead = (notificationId: string) => {
    // Update local state only
    setReadStatus(prev => ({
      ...prev,
      [notificationId]: true
    }));
  };
  
  const markAllAsRead = () => {
    // Update all notifications to read in local state
    const updatedReadStatus = {...readStatus};
    notifications.forEach(notification => {
      updatedReadStatus[notification.id] = true;
    });
    
    setReadStatus(updatedReadStatus);
  };
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Generate notification content based on application
  const getNotificationContent = (application: VolunteerApplication) => {
    return `New volunteer application from ${application.name}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1.5 min-w-[1.25rem] h-5 bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-connect-primary mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto opacity-20 mb-2" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-3 border-b last:border-b-0 flex items-start hover:bg-gray-50 transition-colors cursor-pointer ${!readStatus[notification.id] ? 'bg-blue-50' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex-1 mr-2">
                  <p className="text-sm font-medium">{getNotificationContent(notification)}</p>
                  <p className="text-xs text-gray-500">{formatTimestamp(notification.created_at)}</p>
                </div>
                {!readStatus[notification.id] && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                )}
              </div>
            ))}
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
