
import { Progress } from './ui/progress';

const ImpactSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
          <p className="text-gray-600">See the difference our volunteers and NGOs are making together in communities around the world.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 max-w-5xl mx-auto">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between mb-1">
                <span className="font-medium text-connect-dark">Environment</span>
                <span className="text-sm text-gray-500">78%</span>
              </div>
              <Progress value={78} className="h-2 bg-gray-200" indicatorClassName="bg-green-500" />
              <p className="text-sm text-gray-600">15,230 volunteers participated in environmental initiatives</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between mb-1">
                <span className="font-medium text-connect-dark">Education</span>
                <span className="text-sm text-gray-500">65%</span>
              </div>
              <Progress value={65} className="h-2 bg-gray-200" indicatorClassName="bg-blue-500" />
              <p className="text-sm text-gray-600">8,120 students have received educational support</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between mb-1">
                <span className="font-medium text-connect-dark">Community</span>
                <span className="text-sm text-gray-500">92%</span>
              </div>
              <Progress value={92} className="h-2 bg-gray-200" indicatorClassName="bg-purple-500" />
              <p className="text-sm text-gray-600">23,450 community members impacted by local initiatives</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between mb-1">
                <span className="font-medium text-connect-dark">Healthcare</span>
                <span className="text-sm text-gray-500">45%</span>
              </div>
              <Progress value={45} className="h-2 bg-gray-200" indicatorClassName="bg-red-500" />
              <p className="text-sm text-gray-600">5,670 people received free health checkups and treatments</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-xl shadow-inner flex items-center justify-center">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-60 h-60 rounded-full bg-gradient-to-br from-connect-primary to-connect-secondary opacity-20 absolute animate-pulse-slow"></div>
                <div className="w-52 h-52 rounded-full bg-white flex items-center justify-center relative z-10">
                  <div>
                    <p className="text-5xl font-bold text-connect-primary mb-2">850k+</p>
                    <p className="text-lg text-gray-600">Total Volunteer Hours</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div>
                  <p className="text-2xl font-bold text-connect-primary">126</p>
                  <p className="text-sm text-gray-600">Cities</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-connect-secondary">45</p>
                  <p className="text-sm text-gray-600">Countries</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-connect-accent">12k+</p>
                  <p className="text-sm text-gray-600">Projects</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
