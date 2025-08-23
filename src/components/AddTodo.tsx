import { useState } from 'react';
import { Plus, Calendar, Tag as TagIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateTimePicker } from './DateTimePicker';
import { Priority, Tag, Todo, CustomTag, PredefinedTag } from '@/types/todo';

interface AddTodoProps {
  onAdd: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  customTags: CustomTag[];
}

const getTagColor = (tag: Tag, customTags: CustomTag[]): string => {
  // Check if it's a predefined tag
  const TAG_COLORS: Record<PredefinedTag, string> = {
    work: 'bg-tag-work text-white',
    personal: 'bg-tag-personal text-white',
    urgent: 'bg-tag-urgent text-white',
    health: 'bg-tag-health text-white',
    shopping: 'bg-tag-shopping text-white',
    learning: 'bg-tag-learning text-white',
  };

  if (tag in TAG_COLORS) {
    return TAG_COLORS[tag as PredefinedTag];
  }

  // Check if it's a custom tag
  const customTag = customTags.find(ct => ct.name === tag);
  return customTag ? customTag.color : 'bg-secondary text-secondary-foreground';
};

const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'text-priority-low',
  medium: 'text-priority-medium',
  high: 'text-priority-high',
};

const PREDEFINED_TAGS: PredefinedTag[] = ['work', 'personal', 'urgent', 'health', 'shopping', 'learning'];

export const AddTodo = ({ onAdd, customTags }: AddTodoProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [dueDate, setDueDate] = useState<Date | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      priority,
      tags: selectedTags,
      dueDate,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setSelectedTags([]);
    setDueDate(undefined);
    setIsExpanded(false);
  };

  const toggleTag = (tag: Tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const availableTags = [
    ...PREDEFINED_TAGS,
    ...(Array.isArray(customTags) ? customTags.map(ct => ct.name) : [])
  ];

  if (!isExpanded) {
    return (
      <Card className="border-dashed border-2 hover:border-primary/50 transition-smooth cursor-pointer" 
            onClick={() => setIsExpanded(true)}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-smooth">
            <Plus className="h-5 w-5" />
            <span>Add a new todo</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 shadow-glow">
      <CardContent className="pt-6 pl-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <Input
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg border-none px-0 pl-4 focus-visible:ring-0 placeholder:text-muted-foreground"
            autoFocus
            style={{ paddingTop: '10px', paddingBottom: '10px', paddingLeft: '16px', paddingRight: '16px' }}
          />

          {/* Description */}
          <Textarea
            placeholder="Add a description... (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[80px] resize-none"
          />

          {/* Priority, Tags, and Due Date */}
          <div className="flex flex-wrap gap-3">
            {/* Priority Selector */}
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <span className={PRIORITY_COLORS.low}>Low</span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className={PRIORITY_COLORS.medium}>Medium</span>
                  </SelectItem>
                  <SelectItem value="high">
                    <span className={PRIORITY_COLORS.high}>High</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due Date Picker */}
            <DateTimePicker
              value={dueDate}
              onChange={setDueDate}
              placeholder="Due date & time"
            />

            {/* Tag Selector */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <TagIcon className="h-4 w-4" />
                  Tags ({selectedTags.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Select Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <Badge
                          key={tag}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer transition-smooth capitalize ${
                            isSelected ? getTagColor(tag, customTags) : 'hover:bg-secondary'
                          }`}
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Selected Tags Display */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  className={`${getTagColor(tag, customTags)} capitalize`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={!title.trim()} className="bg-gradient-primary">
              <Plus className="h-4 w-4 mr-1" />
              Add Todo
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsExpanded(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};