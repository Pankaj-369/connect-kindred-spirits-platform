-- Add foreign key constraints to establish proper relationships
ALTER TABLE campaign_applications 
ADD CONSTRAINT campaign_applications_campaign_id_fkey 
FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE;

ALTER TABLE campaign_applications 
ADD CONSTRAINT campaign_applications_volunteer_id_fkey 
FOREIGN KEY (volunteer_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE volunteer_registrations 
ADD CONSTRAINT volunteer_registrations_volunteer_id_fkey 
FOREIGN KEY (volunteer_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE volunteer_registrations 
ADD CONSTRAINT volunteer_registrations_ngo_id_fkey 
FOREIGN KEY (ngo_id) REFERENCES profiles(id) ON DELETE CASCADE;