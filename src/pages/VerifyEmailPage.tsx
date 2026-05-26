import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowRight, Zap, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { authService } from '@/services/authService';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      toast.error('Email not found. Please register again.');
      navigate('/register');
      return;
    }

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.verifyEmail({ email, otp });
      
      if (response.success) {
        toast.success(response.message || 'Email verified successfully!');
        navigate('/login');
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      setError(errorData?.message || 'Invalid OTP. Please try again.');
      toast.error(errorData?.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      toast.error('Email not found. Please register again.');
      navigate('/register');
      return;
    }

    setIsResending(true);

    try {
      const response = await authService.resendVerificationOtp(email);
      
      if (response.success) {
        toast.success(response.message || 'New OTP sent to your email.');
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      toast.error(errorData?.message || 'Failed to resend OTP.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
          <CardDescription>
            Enter the 6-digit OTP sent to <span className="font-medium">{email}</span>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">One-Time Password (OTP)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setError('');
                  }}
                  className={`pl-9 text-center text-lg tracking-widest ${error ? 'border-destructive' : ''}`}
                  required
                  maxLength={6}
                />
              </div>
              {error && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm"
              onClick={handleResendOtp}
              disabled={isResending}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isResending ? 'animate-spin' : ''}`} />
              {isResending ? 'Resending...' : "Didn't receive OTP? Resend"}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify Email'}
              {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Link to="/register" className="flex items-center hover:text-primary">
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back to Register
              </Link>
              <span>•</span>
              <Link to="/login" className="hover:text-primary">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
