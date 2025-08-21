-- Add only the missing foreign key constraints
ALTER TABLE campaign_applications 
ADD CONSTRAINT campaign_applications_campaign_id_fkey 
FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE;

ALTER TABLE campaign_applications 
ADD CONSTRAINT campaign_applications_volunteer_id_fkey 
FOREIGN KEY (volunteer_id) REFERENCES profiles(id) ON DELETE CASCADE;