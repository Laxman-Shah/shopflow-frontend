import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Zap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toastUtils } from '@/lib/toast';
import { authService } from '@/services/authService';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.forgotPassword({ email });
      
      if (response.success) {
        setIsSuccess(true);
        toastUtils.auth.forgotPasswordSuccess();
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      toastUtils.auth.forgotPasswordFailed(errorData?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/reset-password', { state: { email } });
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
            <CardDescription>
              We've sent a password reset OTP to <span className="font-medium">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              The OTP will expire in a few minutes. Please check your inbox and spam folder.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button onClick={handleContinue} className="w-full">
              Continue to Reset Password
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="ghost" onClick={() => setIsSuccess(false)} className="w-full">
              Try different email
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
          <CardDescription>Enter your email to receive a password reset OTP</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset OTP'}
              {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Link to="/login" className="flex items-center hover:text-primary">
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back to Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
