import { Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAdvancedTheme } from '@/hooks/useAdvancedTheme';
import { ACCENT_THEMES, AccentTheme } from '@/types/theme';

export const ThemeSelector = () => {
  const { theme, setAccent } = useAdvancedTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Palette className="h-4 w-4" />
          <div 
            className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background"
            style={{ 
              backgroundColor: ACCENT_THEMES[theme.accent].color 
            }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2">Theme Colors</h4>
            <p className="text-xs text-muted-foreground">
              Choose your preferred accent color
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(ACCENT_THEMES).map(([key, { name, color }]) => (
              <Card
                key={key}
                className={`cursor-pointer transition-smooth hover:shadow-md ${
                  theme.accent === key ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setAccent(key as AccentTheme)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-border"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{name}</p>
                    </div>
                    {theme.accent === key && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Theme Preview */}
          <Card className="border-dashed">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gradient-primary" />
                  <span className="text-sm font-medium">Preview</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  This is how your selected theme will look
                </div>
                <Button size="sm" className="bg-gradient-primary w-full">
                  Sample Button
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PopoverContent>
    </Popover>
  );
};