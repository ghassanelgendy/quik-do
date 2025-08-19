import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export const DateTimePicker = ({ 
  value, 
  onChange, 
  placeholder = "Pick date & time",
  className 
}: DateTimePickerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
  const [timeString, setTimeString] = useState(() => {
    return value ? format(value, 'HH:mm') : '09:00';
  });

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      // Combine date with current time
      const [hours, minutes] = timeString.split(':').map(Number);
      const newDateTime = new Date(date);
      newDateTime.setHours(hours, minutes);
      onChange(newDateTime);
    } else {
      onChange(undefined);
    }
  };

  const handleTimeChange = (time: string) => {
    setTimeString(time);
    if (selectedDate) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(hours, minutes);
      onChange(newDateTime);
    }
  };

  const formatDisplayValue = (date: Date) => {
    return format(date, 'MMM dd, yyyy \'at\' HH:mm');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal gap-2",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {value ? formatDisplayValue(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Tabs defaultValue="date" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="date" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              Date
            </TabsTrigger>
            <TabsTrigger value="time" className="gap-2">
              <Clock className="h-4 w-4" />
              Time
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="date" className="p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
              className="p-3 pointer-events-auto"
            />
            {selectedDate && (
              <div className="p-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDateSelect(undefined)}
                  className="w-full"
                >
                  Clear date
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="time" className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="time-input">Time</Label>
                <Input
                  id="time-input"
                  type="time"
                  value={timeString}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full"
                />
              </div>
              
              {/* Quick time presets */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Quick select</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['09:00', '12:00', '15:00', '18:00', '20:00', '22:00'].map((time) => (
                    <Button
                      key={time}
                      variant="outline"
                      size="sm"
                      onClick={() => handleTimeChange(time)}
                      className={cn(
                        "text-xs",
                        timeString === time && "bg-primary text-primary-foreground"
                      )}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
              
              {selectedDate && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground text-center">
                    {formatDisplayValue(
                      (() => {
                        const [hours, minutes] = timeString.split(':').map(Number);
                        const date = new Date(selectedDate);
                        date.setHours(hours, minutes);
                        return date;
                      })()
                    )}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};