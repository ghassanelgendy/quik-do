import { LogIn, LogOut, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const AuthButtons = () => {
  const { user, loginWithEmail, registerWithEmail, loginWithGoogle, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    displayName?: string;
  }>({});



  const validateForm = () => {
    const errors: typeof validationErrors = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (mode === 'register') {
      if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      } else if (!/(?=.*[a-z])/.test(password)) {
        errors.password = 'Password must contain at least one lowercase letter';
      } else if (!/(?=.*[A-Z])/.test(password)) {
        errors.password = 'Password must contain at least one uppercase letter';
      } else if (!/(?=.*\d)/.test(password)) {
        errors.password = 'Password must contain at least one number';
      }
    }

    // Display name validation for register
    if (mode === 'register' && displayName && displayName.length < 2) {
      errors.displayName = 'Display name must be at least 2 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, displayName || undefined);
      }
      setOpen(false);
      setEmail('');
      setPassword('');
      setDisplayName('');
      setValidationErrors({});
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => logout()} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" onClick={() => { setMode('register'); setOpen(true); }} className="flex items-center gap-2">
        <UserPlus className="h-4 w-4" />
        <span className="hidden sm:inline">Register</span>
      </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md w-[90vw] mx-auto">
          <DialogHeader>
            <DialogTitle>{mode === 'login' ? 'Login' : 'Register'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="grid gap-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input 
                  id="displayName" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)} 
                  placeholder="Your name"
                  className={validationErrors.displayName ? 'border-red-500' : ''}
                />
                {validationErrors.displayName && (
                  <span className="text-xs text-red-500">{validationErrors.displayName}</span>
                )}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com" 
                required
                className={validationErrors.email ? 'border-red-500' : ''}
              />
              {validationErrors.email && (
                <span className="text-xs text-red-500">{validationErrors.email}</span>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                className={validationErrors.password ? 'border-red-500' : ''}
              />
              {validationErrors.password && (
                <span className="text-xs text-red-500">{validationErrors.password}</span>
              )}
              {mode === 'register' && (
                <span className="text-xs text-muted-foreground">
                  Must be at least 6 characters with uppercase, lowercase, and number
                </span>
              )}
            </div>
            {error && <div className="text-sm text-red-500">{error}</div>}
            <DialogFooter className="flex flex-col gap-2">
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Create account')}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-sm text-primary hover:underline cursor-pointer bg-transparent border-none"
                >
                  {mode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
                </button>
              </div>
            </DialogFooter>
          </form>
          <div className="pt-2 border-t">
            <Button 
              variant="outline" 
              className="w-full mt-2" 
              disabled={submitting}
              onClick={async () => {
                setSubmitting(true);
                setError(null);
                try {
                  await loginWithGoogle();
                  setOpen(false);
                } catch (err: any) {
                  setError(err?.message || 'Google sign-in failed');
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Button variant="outline" size="sm" onClick={() => { setMode('login'); setOpen(true); }} className="flex items-center gap-2">
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">Login</span>
      </Button>
    </div>
  );
};
