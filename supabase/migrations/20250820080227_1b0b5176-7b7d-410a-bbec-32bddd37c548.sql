-- Create campaigns table for NGO campaigns/drives
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ngo_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  date DATE,
  goal TEXT,
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies for campaigns
CREATE POLICY "Campaigns are viewable by everyone" 
ON public.campaigns 
FOR SELECT 
USING (true);

CREATE POLICY "NGOs can create their own campaigns" 
ON public.campaigns 
FOR INSERT 
WITH CHECK (ngo_id = auth.uid());

CREATE POLICY "NGOs can update their own campaigns" 
ON public.campaigns 
FOR UPDATE 
USING (ngo_id = auth.uid());

CREATE POLICY "NGOs can delete their own campaigns" 
ON public.campaigns 
FOR DELETE 
USING (ngo_id = auth.uid());

-- Create campaign_applications table for volunteer applications to campaigns
CREATE TABLE public.campaign_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL,
  volunteer_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  interest TEXT,
  availability TEXT,
  skills TEXT[],
  experience TEXT,
  additional_info TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, volunteer_id)
);

-- Enable Row Level Security
ALTER TABLE public.campaign_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for campaign applications
CREATE POLICY "Volunteers can view their own applications" 
ON public.campaign_applications 
FOR SELECT 
USING (volunteer_id = auth.uid());

CREATE POLICY "NGOs can view applications to their campaigns" 
ON public.campaign_applications 
FOR SELECT 
USING (
  campaign_id IN (
    SELECT id FROM public.campaigns WHERE ngo_id = auth.uid()
  )
);

CREATE POLICY "Volunteers can create applications" 
ON public.campaign_applications 
FOR INSERT 
WITH CHECK (volunteer_id = auth.uid());

CREATE POLICY "NGOs can update applications to their campaigns" 
ON public.campaign_applications 
FOR UPDATE 
USING (
  campaign_id IN (
    SELECT id FROM public.campaigns WHERE ngo_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaign_applications_updated_at
  BEFORE UPDATE ON public.campaign_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample campaigns for demonstration
INSERT INTO public.campaigns (ngo_id, title, description, location, date, goal, image_url, category) VALUES
-- We'll use the first NGO profile as the owner of these campaigns
((SELECT id FROM public.profiles WHERE is_ngo = true LIMIT 1), 'Beach Cleanup Drive', 'Join us for a comprehensive beach cleanup to protect marine life and keep our shores pristine.', 'Miami Beach, FL', '2025-06-15', '100 volunteers', 'https://images.unsplash.com/photo-1544307399-86bef69e7dc8', 'Environment'),
((SELECT id FROM public.profiles WHERE is_ngo = true LIMIT 1), 'Tree Plantation Drive', 'Help us plant 1000 trees in the community to combat climate change and improve air quality.', 'Central Park, NY', '2025-06-22', '50 volunteers', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09', 'Environment'),
((SELECT id FROM public.profiles WHERE is_ngo = true LIMIT 1), 'Food Distribution Campaign', 'Distribute meals to homeless individuals and families in need across the city.', 'Downtown Community Center', '2025-07-01', '30 volunteers', 'https://images.unsplash.com/photo-1534732806146-b3bf32171b48', 'Community'),
((SELECT id FROM public.profiles WHERE is_ngo = true LIMIT 1), 'Education Support Drive', 'Help underprivileged children with tutoring and educational supplies.', 'Local Schools', '2025-07-10', '25 volunteers', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b', 'Education');