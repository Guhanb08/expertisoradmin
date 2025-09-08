'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Icons } from '@/components/icons';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      if (data && data.user) {
        toast.success('Login successful!');
        router.push('/dashboard/overview'); // Redirect to dashboard after successful login
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const fillCredentials = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
  };

  const testUsers = [
    { role: 'Admin', email: 'admin@jobs.com', password: 'admin', color: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300' },
    { role: 'Candidate', email: 'candidate@jobs.com', password: 'candidate', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200' },
    { role: 'Client', email: 'client@jobs.com', password: 'client', color: 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <p className="text-muted-foreground">Enter your credentials to access your account</p>
        </CardHeader>
        <CardContent>
          {/* Easy Login Section */}
        

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  disabled={loading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <Icons.eyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Icons.eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <Icons.warning className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-3 pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={handleBackToHome}
                disabled={loading}
              >
                Back to Home
              </Button>
            </div>
          </form>  
          
          <div className="mt-6">
            <div className="grid grid-cols-1 gap-2">
              {testUsers.map((user) => (
                <Button
                  key={user.role}
                  type="button"
                  size="sm"
                  variant="outline"
                  className={`${user.color} text-xs font-medium`}
                  onClick={() => fillCredentials(user.email, user.password)}
                >
                  {user.role}: {user.email} / {user.password}
                </Button>
              ))}
            </div>
          </div>
         
        </CardContent>
      </Card>
    </div>
  );
}
