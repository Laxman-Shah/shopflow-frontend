import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Zap, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toastUtils } from '@/lib/toast';
import { authService, type ResetPasswordRequest } from '@/services/authService';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = 'Email not found. Please request password reset again.';
    }
    
    if (formData.otp.length !== 6) {
      newErrors.otp = 'Please enter a valid 6-digit OTP';
    }
    
    if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (formData.newPassword.length > 100) {
      newErrors.newPassword = 'Password must be less than 100 characters';
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!email) {
      toastUtils.error('Email not found. Please request password reset again.');
      navigate('/forgot-password');
      return;
    }

    setIsLoading(true);

    try {
      const request: ResetPasswordRequest = {
        email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      };
      const response = await authService.resetPassword(request);

      if (response.success) {
        toastUtils.auth.resetPasswordSuccess();
        navigate('/login');
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || 'Password reset failed. Please try again.';

      if (errorMessage.toLowerCase().includes('otp')) {
        setErrors({ otp: errorMessage });
      } else {
        toastUtils.auth.resetPasswordFailed(errorMessage);
      }
    } finally {
      setIsLoading(false);
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
          <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
          <CardDescription>
            Enter the OTP and your new password for <span className="font-medium">{email}</span>
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
                  value={formData.otp}
                  onChange={(e) => {
                    setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) });
                    setErrors({ ...errors, otp: '' });
                  }}
                  className={`pl-9 text-center text-lg tracking-widest ${errors.otp ? 'border-destructive' : ''}`}
                  required
                  maxLength={6}
                />
              </div>
              {errors.otp && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.otp}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, newPassword: e.target.value });
                    setErrors({ ...errors, newPassword: '', confirmPassword: '' });
                  }}
                  className={`pl-9 ${errors.newPassword ? 'border-destructive' : ''}`}
                  required
                  minLength={8}
                  maxLength={100}
                />
              </div>
              {errors.newPassword && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.newPassword}
                </p>
              )}
              {!errors.newPassword && (
                <p className="text-xs text-muted-foreground">
                  Must be between 8 and 100 characters
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    setErrors({ ...errors, confirmPassword: '' });
                  }}
                  className={`pl-9 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  required
                  minLength={8}
                  maxLength={100}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
              {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Link to="/forgot-password" className="flex items-center hover:text-primary">
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back to Forgot Password
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
