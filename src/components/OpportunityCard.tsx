
import { useNavigate } from 'react-router-dom';
import { Calendar, Heart, MapPin, Users } from 'lucide-react';
import { Button } from './ui/button';

interface OpportunityCardProps {
  id: number;
  title: string;
  organization: string;
  location: string;
  date: string;
  spots: number;
  image: string;
  category: string;
  onApply?: () => void;
}

const OpportunityCard = ({
  id,
  title,
  organization,
  location,
  date,
  spots,
  image,
  category,
  onApply
}: OpportunityCardProps) => {
  const navigate = useNavigate();
  
  const handleViewDetails = () => {
    // Assuming the organization has an ID that matches the NGO id
    // In a real implementation, this would come from the data
    navigate(`/ngo/${id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden card-hover">
      <div className="relative h-48">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <span className="absolute top-4 left-4 badge-primary">{category}</span>
        <button className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
          <Heart className="h-4 w-4 text-gray-500 hover:text-connect-primary transition-colors" />
        </button>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <img
            src={`https://ui-avatars.com/api/?name=${organization.replace(/ /g, '+')}&background=random`}
            alt={organization}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-sm text-gray-600">{organization}</span>
        </div>
        <h3 className="font-bold text-lg mb-2 text-connect-dark line-clamp-2">{title}</h3>
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-connect-primary" />
            <span>{location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-connect-primary" />
            <span>{date}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2 text-connect-primary" />
            <span>{spots} spots left</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
          <Button 
            className="flex-1 bg-connect-primary hover:bg-connect-primary/90"
            onClick={onApply}
          >
            Apply Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;
