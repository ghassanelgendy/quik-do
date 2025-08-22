import { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TagManager } from './TagManager';
import { ThemeSelector } from './ThemeSelector';
import { ThemeToggle } from './ThemeToggle';
import { CustomTag } from '@/types/todo';

interface SettingsProps {
  customTags: CustomTag[];
  onAddCustomTag: (tagData: Omit<CustomTag, 'id' | 'createdAt'>) => void;
  onUpdateCustomTag: (id: string, updates: Partial<CustomTag>) => void;
  onDeleteCustomTag: (id: string) => void;
}

export const Settings = ({
  customTags,
  onAddCustomTag,
  onUpdateCustomTag,
  onDeleteCustomTag,
}: SettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10"
        >
          <SettingsIcon className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 p-4 space-y-4"
        sideOffset={8}
      >
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Theme</h3>
          <div className="flex items-center gap-2">
            <ThemeSelector />
            <ThemeToggle />
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Tags</h3>
          <TagManager
            customTags={customTags}
            onAddCustomTag={onAddCustomTag}
            onUpdateCustomTag={onUpdateCustomTag}
            onDeleteCustomTag={onDeleteCustomTag}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
