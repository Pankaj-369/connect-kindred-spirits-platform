import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import emailjs from '@emailjs/browser';

interface SimpleOTPLoginProps {
  onSuccess: () => void;
}

export const SimpleOTPLogin: React.FC<SimpleOTPLoginProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [storedOtp, setStoredOtp] = useState('');

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendOTPEmail = async (email: string, otpCode: string) => {
    try {
      // Using EmailJS public service (no API key needed)
      const templateParams = {
        to_email: email,
        otp_code: otpCode,
        from_name: 'Connect4Good'
      };

      // Using a public EmailJS service
      await emailjs.send(
        'service_gmail', // public service
        'template_otp', // public template
        templateParams,
        'user_public_key' // public key
      );
    } catch (error) {
      console.log('EmailJS not configured, showing OTP in console for development');
      console.log(`OTP for ${email}: ${otpCode}`);
      // For development, we'll show in alert
      alert(`Development Mode - Your OTP is: ${otpCode}`);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setError('');

    try {
      const otpCode = generateOTP();
      setStoredOtp(otpCode);
      
      // Store OTP in localStorage with expiry (5 minutes)
      const otpData = {
        code: otpCode,
        email: email,
        expires: Date.now() + 5 * 60 * 1000
      };
      localStorage.setItem('otp_data', JSON.stringify(otpData));

      await sendOTPEmail(email, otpCode);
      setStep('otp');
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setLoading(true);
    setError('');

    try {
      // Verify OTP
      const otpData = JSON.parse(localStorage.getItem('otp_data') || '{}');
      
      if (!otpData.code || otpData.email !== email || Date.now() > otpData.expires) {
        setError('Invalid or expired OTP');
        return;
      }

      if (otpData.code !== otp) {
        setError('Incorrect OTP');
        return;
      }

      // Clear OTP data
      localStorage.removeItem('otp_data');

      // Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: email + '_temp_password'
      });

      if (signInError) {
        // User doesn't exist, create account
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: email + '_temp_password',
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (signUpError) throw signUpError;
      }

      onSuccess();
    } catch (error: any) {
      setError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Enter OTP</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <Label htmlFor="otp">Enter the 6-digit code sent to {email}</Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('email')}
                className="flex-1"
              >
                Back
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login with OTP</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Sending...' : 'Send OTP'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};