
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

// Interface for notifications
interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  type: 'application' | 'status_update';
  is_read?: boolean;
}

// Interface for volunteer applications (used as notifications for NGOs)
interface VolunteerApplication {
  id: string;
  name: string;
  email: string;
  created_at: string;
  interest?: string;
  status: string;
  campaign_id?: string;
}

// Interface for campaign applications (used for volunteer notifications)
interface CampaignApplication {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  status: string;
  campaign_id: string;
  campaigns?: {
    title: string;
    ngo_id: string;
  };
}

const NotificationCenter: React.FC = () => {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readStatus, setReadStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Get unread count based on our local read status tracking
  const unreadCount = notifications.filter(n => !readStatus[n.id]).length;

  useEffect(() => {
    if (!user || !profile) return;
    
    const fetchNotifications = async () => {
      try {
        let transformedNotifications: Notification[] = [];

        if (profile.is_ngo) {
          // NGO notifications - new volunteer applications
          const { data: volunteerApps, error: volunteerError } = await supabase
            .from('volunteer_registrations')
            .select('*')
            .eq('ngo_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

          if (volunteerError) throw volunteerError;

          const volunteerNotifications: Notification[] = volunteerApps?.map(app => ({
            id: app.id,
            title: 'New Volunteer Application',
            message: `${app.name} applied to volunteer${app.interest ? ` for ${app.interest}` : ''}`,
            created_at: app.created_at,
            type: 'application' as const,
          })) || [];

          // Campaign applications
          const { data: campaignApps, error: campaignError } = await supabase
            .from('campaign_applications')
            .select(`
              *,
              campaigns!inner(title, ngo_id)
            `)
            .eq('campaigns.ngo_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

          if (campaignError) throw campaignError;

          const campaignNotifications: Notification[] = campaignApps?.map(app => ({
            id: `campaign_${app.id}`,
            title: 'Campaign Application',
            message: `${app.name} applied for "${app.campaigns?.title}"`,
            created_at: app.created_at,
            type: 'application' as const,
          })) || [];

          transformedNotifications = [...volunteerNotifications, ...campaignNotifications]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 20);

        } else {
          // Volunteer notifications - application status updates
          const { data: applications, error } = await supabase
            .from('campaign_applications')
            .select(`
              *,
              campaigns!inner(title)
            `)
            .eq('volunteer_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(20);

          if (error) throw error;

          transformedNotifications = applications?.map(app => ({
            id: app.id,
            title: getStatusTitle(app.status),
            message: `Your application for "${app.campaigns?.title}" has been ${app.status}`,
            created_at: app.updated_at,
            type: 'status_update' as const,
          })) || [];
        }

        // Initialize all as unread for first load
        const newReadStatus: Record<string, boolean> = {};
        transformedNotifications.forEach(item => {
          newReadStatus[item.id] = false;
        });
        
        setReadStatus(prev => ({...prev, ...newReadStatus}));
        setNotifications(transformedNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Set up subscriptions
    const channels: any[] = [];

    if (profile.is_ngo) {
      // Listen for new volunteer applications
      const volunteerChannel = supabase
        .channel('volunteer-applications')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'volunteer_registrations',
          filter: `ngo_id=eq.${user.id}` 
        }, (payload) => {
          const newNotification: Notification = {
            id: payload.new.id,
            title: 'New Volunteer Application',
            message: `${payload.new.name} applied to volunteer${payload.new.interest ? ` for ${payload.new.interest}` : ''}`,
            created_at: payload.new.created_at,
            type: 'application'
          };
          setNotifications(prev => [newNotification, ...prev]);
          setReadStatus(prev => ({...prev, [payload.new.id]: false}));
        })
        .subscribe();

      // Listen for new campaign applications
      const campaignChannel = supabase
        .channel('campaign-applications')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'campaign_applications' 
        }, async (payload) => {
          // Fetch campaign details
          const { data: campaign } = await supabase
            .from('campaigns')
            .select('title, ngo_id')
            .eq('id', payload.new.campaign_id)
            .single();

          if (campaign?.ngo_id === user.id) {
            const newNotification: Notification = {
              id: `campaign_${payload.new.id}`,
              title: 'Campaign Application',
              message: `${payload.new.name} applied for "${campaign.title}"`,
              created_at: payload.new.created_at,
              type: 'application'
            };
            setNotifications(prev => [newNotification, ...prev]);
            setReadStatus(prev => ({...prev, [`campaign_${payload.new.id}`]: false}));
          }
        })
        .subscribe();

      channels.push(volunteerChannel, campaignChannel);
    } else {
      // Listen for status updates on volunteer's applications
      const statusChannel = supabase
        .channel('application-status-updates')
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'campaign_applications',
          filter: `volunteer_id=eq.${user.id}` 
        }, async (payload) => {
          // Fetch campaign details
          const { data: campaign } = await supabase
            .from('campaigns')
            .select('title')
            .eq('id', payload.new.campaign_id)
            .single();

          const newNotification: Notification = {
            id: `status_${payload.new.id}_${Date.now()}`,
            title: getStatusTitle(payload.new.status),
            message: `Your application for "${campaign?.title}" has been ${payload.new.status}`,
            created_at: payload.new.updated_at,
            type: 'status_update'
          };
          setNotifications(prev => [newNotification, ...prev]);
          setReadStatus(prev => ({...prev, [newNotification.id]: false}));
        })
        .subscribe();

      channels.push(statusChannel);
    }
      
    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user, profile]);

  const getStatusTitle = (status: string) => {
    switch (status) {
      case 'approved': return 'Application Approved! 🎉';
      case 'rejected': return 'Application Update';
      default: return 'Application Status Update';
    }
  };
  
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

  // Generate notification content
  const getNotificationIcon = (notification: Notification) => {
    if (notification.type === 'application') {
      return '👥';
    } else if (notification.title.includes('Approved')) {
      return '✅';
    } else if (notification.title.includes('Rejected')) {
      return '❌';
    }
    return '📄';
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
                <div className="text-lg mr-3 mt-0.5">
                  {getNotificationIcon(notification)}
                </div>
                <div className="flex-1 mr-2">
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatTimestamp(notification.created_at)}</p>
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
