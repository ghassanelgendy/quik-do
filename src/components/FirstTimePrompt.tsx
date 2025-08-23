import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Cloud, HardDrive, Shield, Zap } from 'lucide-react';
import { AuthButtons } from './AuthButtons';

interface FirstTimePromptProps {
  isOpen: boolean;
  onClose: () => void;
  onPreferenceSet: (preferCloud: boolean) => void;
}

export const FirstTimePrompt = ({ isOpen, onClose, onPreferenceSet }: FirstTimePromptProps) => {
  const [showAuth, setShowAuth] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'offline' | 'cloud' | null>(null);

  const handleOptionSelect = (option: 'offline' | 'cloud') => {
    setSelectedOption(option);
    if (option === 'offline') {
      // User chose offline - no authentication needed
      localStorage.setItem('preferCloud', 'false');
      localStorage.setItem('hasSeenFirstTimePrompt', 'true');
      onPreferenceSet(false);
      onClose();
    } else {
      // User chose cloud - show authentication
      setShowAuth(true);
    }
  };

  const handleAuthSuccess = () => {
    // User successfully authenticated for cloud storage
    localStorage.setItem('preferCloud', 'true');
    localStorage.setItem('hasSeenFirstTimePrompt', 'true');
    onPreferenceSet(true);
    onClose();
  };

  const handleBackToOptions = () => {
    setShowAuth(false);
    setSelectedOption(null);
  };

  if (showAuth) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-blue-500" />
              Enable Cloud Sync
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To sync your todos across devices, please sign in or create an account.
            </p>
            <AuthButtons onAuthSuccess={handleAuthSuccess} inModalLayout />
            <Button 
              variant="outline" 
              onClick={handleBackToOptions}
              className="w-full"
            >
              Back to options
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to Quik-do!</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose how you'd like to store your todos:
          </p>
          
          <div className="space-y-3">
            {/* Offline Option */}
            <button
              onClick={() => handleOptionSelect('offline')}
              className={`w-full p-4 border rounded-lg text-left transition-colors ${
                selectedOption === 'offline' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <HardDrive className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium">Offline Mode</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Store todos locally on your device. Fast, private, and works offline.
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Instant
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Private
                    </span>
                  </div>
                </div>
              </div>
            </button>

            {/* Cloud Option */}
            <button
              onClick={() => handleOptionSelect('cloud')}
              className={`w-full p-4 border rounded-lg text-left transition-colors ${
                selectedOption === 'cloud' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <Cloud className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium">Cloud Sync</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sync todos across all your devices. Access from anywhere.
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Cloud className="h-3 w-3" />
                      Sync
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Secure
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            You can change this preference later in settings.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
