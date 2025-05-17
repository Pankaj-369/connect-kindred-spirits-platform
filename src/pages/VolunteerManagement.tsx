
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DriveApplicationsManagement from '@/components/DriveApplicationsManagement';

const VolunteerManagement = () => {
  const [activeTab, setActiveTab] = useState('applications');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Volunteer Management</h1>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="volunteers">Active Volunteers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="applications" className="space-y-4">
          <p className="text-gray-600 mb-4">
            Review and manage applications from volunteers for your opportunities.
          </p>
          
          <DriveApplicationsManagement />
        </TabsContent>
        
        <TabsContent value="volunteers" className="space-y-4">
          <p className="text-gray-600 mb-4">
            Manage your active volunteers and their assignments.
          </p>
          
          <Card>
            <CardHeader>
              <CardTitle>Active Volunteers</CardTitle>
              <CardDescription>
                Volunteers currently working with your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No active volunteers yet. Approve volunteer applications to see them here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VolunteerManagement;
