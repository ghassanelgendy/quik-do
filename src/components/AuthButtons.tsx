import { LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AuthButtons = () => {
  const handleLogin = () => {
    // TODO: Implement login functionality
    console.log('Login clicked');
  };

  const handleRegister = () => {
    // TODO: Implement register functionality
    console.log('Register clicked');
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        onClick={handleRegister}
        className="flex items-center gap-2"
      >
        <UserPlus className="h-4 w-4" />
        <span className="hidden sm:inline">Register</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogin}
        className="flex items-center gap-2"
      >
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">Login</span>
      </Button>
    </div>
  );
};
