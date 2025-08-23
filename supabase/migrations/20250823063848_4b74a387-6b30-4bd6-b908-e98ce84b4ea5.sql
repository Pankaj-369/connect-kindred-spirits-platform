-- Create OTP table for temporary storage
CREATE TABLE public.otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '5 minutes'),
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for OTP codes
CREATE POLICY "Anyone can insert OTP codes" 
ON public.otp_codes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can select their own OTP codes" 
ON public.otp_codes 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update their own OTP codes" 
ON public.otp_codes 
FOR UPDATE 
USING (true);

-- Create function to clean up expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.otp_codes WHERE expires_at < now();
END;
$$;