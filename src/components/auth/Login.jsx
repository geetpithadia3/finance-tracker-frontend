import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PiggyBank, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth';

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await authApi.login({
        username: formData.username,
        password: formData.password
      });
      
      // Extract the access token from the response
      const userData = {
        username: formData.username,
        token: response.accessToken
      };
      
      login(userData);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
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
                <h1 className="text-3xl font-bold text-foreground">Sumi</h1>
                <p className="text-sm text-muted-foreground">The Art of Intentional Finance</p>
              </div>
            </div>
            
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p className="italic">
                "Just as a Sumi master achieves perfect balance with deliberate brushstrokes, 
                Sumi Finance helps you achieve financial harmony through mindful, intentional money management."
              </p>
              
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <span className="text-primary mt-1">🖌️</span>
                  <span><strong>Simplicity over Complexity</strong> - Strip away financial clutter to see what truly matters</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-primary mt-1">✨</span>
                  <span><strong>Intentional Action</strong> - Every financial decision is a deliberate brushstroke</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-primary mt-1">⚖️</span>
                  <span><strong>Balance & Flow</strong> - Money should move with purpose and grace</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-primary mt-1">🎯</span>
                  <span><strong>Mindful Minimalism</strong> - Focus on essential goals, eliminate the unnecessary</span>
                </div>
              </div>
              
              <p className="italic text-xs border-l-2 border-primary/30 pl-3 mt-4">
                "In Sumi, the empty space is as important as the ink. In finance, knowing when NOT to spend is as valuable as knowing when to invest."
              </p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <Card className="w-full max-w-md lg:max-w-sm flex-shrink-0">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <PiggyBank className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your Sumi Finance account
            </CardDescription>
            
            {/* Mobile Philosophy Preview */}
            <div className="lg:hidden mt-4 p-3 bg-muted/50 rounded-lg text-left">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">墨</span>
                <span className="text-xs text-muted-foreground font-medium">The Art of Intentional Finance</span>
              </div>
              <p className="text-xs text-muted-foreground italic">
                "Mindful money management through simplicity, intention, and balance"
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
            
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
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

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link 
                to="/register" 
                className="text-primary hover:underline font-medium"
              >
                Create account
              </Link>
            </p>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;