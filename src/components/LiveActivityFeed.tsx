import { useEffect, useState } from 'react';
import { Heart, Users, Calendar, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'volunteer_joined' | 'ngo_registered' | 'project_completed' | 'event_created';
  message: string;
  timestamp: Date;
  location?: string;
  icon: React.ReactNode;
}

const LiveActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mock activities - in real app, this would come from your backend
  const mockActivities: Activity[] = [
    {
      id: '1',
      type: 'volunteer_joined',
      message: 'Sarah joined Clean Ocean Initiative',
      timestamp: new Date(),
      location: 'Mumbai, India',
      icon: <Users className="h-4 w-4 text-blue-500" />
    },
    {
      id: '2',
      type: 'project_completed',
      message: '50 trees planted in Community Garden Project',
      timestamp: new Date(),
      location: 'Delhi, India',
      icon: <Heart className="h-4 w-4 text-green-500" />
    },
    {
      id: '3',
      type: 'ngo_registered',
      message: 'Education For All NGO joined the platform',
      timestamp: new Date(),
      location: 'Bangalore, India',
      icon: <Users className="h-4 w-4 text-purple-500" />
    },
    {
      id: '4',
      type: 'event_created',
      message: 'Beach Cleanup Drive scheduled for next week',
      timestamp: new Date(),
      location: 'Goa, India',
      icon: <Calendar className="h-4 w-4 text-orange-500" />
    },
    {
      id: '5',
      type: 'volunteer_joined',
      message: 'Rahul applied for Teaching Assistant role',
      timestamp: new Date(),
      location: 'Chennai, India',
      icon: <Users className="h-4 w-4 text-blue-500" />
    }
  ];

  useEffect(() => {
    setActivities(mockActivities);
  }, []);

  useEffect(() => {
    if (activities.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [activities.length]);

  if (activities.length === 0) return null;

  const currentActivity = activities[currentIndex];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Live Activity</h3>
        <div className="flex items-center space-x-1">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div 
          key={currentActivity.id}
          className={cn(
            "flex items-start space-x-3 p-3 rounded-md bg-gray-50 transition-all duration-500",
            "animate-slide-in"
          )}
        >
          <div className="flex-shrink-0 mt-0.5">
            {currentActivity.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {currentActivity.message}
            </p>
            {currentActivity.location && (
              <div className="flex items-center mt-1">
                <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                <p className="text-xs text-gray-500">{currentActivity.location}</p>
              </div>
            )}
          </div>
          <div className="text-xs text-gray-400">
            just now
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-3 space-x-1">
        {activities.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors",
              index === currentIndex ? "bg-primary" : "bg-gray-300"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default LiveActivityFeed;