import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PiggyBank, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/auth';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Enhanced password validation
    const validatePassword = (password) => {
      const minLength = 8;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      
      if (password.length < minLength) {
        return 'Password must be at least 8 characters long';
      }
      if (!hasUpperCase) {
        return 'Password must contain at least one uppercase letter';
      }
      if (!hasLowerCase) {
        return 'Password must contain at least one lowercase letter';
      }
      if (!hasNumbers) {
        return 'Password must contain at least one number';
      }
      if (!hasSpecialChar) {
        return 'Password must contain at least one special character';
      }
      return null;
    };

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);

    try {
      await authApi.register({
        username: formData.username,
        password: formData.password
      });
      
      navigate('/login', { 
        state: { message: 'Registration successful! Please log in.' }
      });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-6 px-2 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl flex items-center gap-8">
        {/* Philosophy Panel */}
        <div className="hidden lg:flex flex-1 flex-col justify-center space-y-6 pr-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">墨</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Begin Your Sumi Journey</h1>
                <p className="text-sm text-muted-foreground">Master the Art of Financial Balance</p>
              </div>
            </div>
            
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p className="italic">
                "Every financial master begins with a single, intentional stroke. Today, you take the first step toward mindful wealth creation."
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <span className="text-primary mt-1">🎯</span>
                    <div>
                      <div className="font-medium text-foreground">Set Clear Intentions</div>
                      <div className="text-xs">Define your financial goals with precision</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-primary mt-1">⚖️</span>
                    <div>
                      <div className="font-medium text-foreground">Find Your Balance</div>
                      <div className="text-xs">Harmony between spending and saving</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <span className="text-primary mt-1">🧘</span>
                    <div>
                      <div className="font-medium text-foreground">Practice Mindfulness</div>
                      <div className="text-xs">Each transaction becomes deliberate</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-primary mt-1">✨</span>
                    <div>
                      <div className="font-medium text-foreground">Embrace Simplicity</div>
                      <div className="text-xs">Complex finances, simple insights</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-primary/5 rounded-lg border-l-4 border-primary/30">
                <p className="text-xs italic">
                  "The journey of a thousand miles begins with a single step. The journey to financial freedom begins with mindful intention."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Register Form */}
        <Card className="w-full max-w-md lg:max-w-sm flex-shrink-0">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <PiggyBank className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Begin Your Journey</CardTitle>
            <CardDescription>
              Create your Sumi Finance account
            </CardDescription>
            
            {/* Mobile Philosophy Preview */}
            <div className="lg:hidden mt-4 p-3 bg-muted/50 rounded-lg text-left">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">墨</span>
                <span className="text-xs text-muted-foreground font-medium">Master the Art of Financial Balance</span>
              </div>
              <p className="text-xs text-muted-foreground italic">
                "Every financial master begins with a single, intentional stroke"
              </p>
            </div>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;