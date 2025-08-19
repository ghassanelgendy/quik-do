import { useState } from 'react';
import { Check, Edit, Trash2, Calendar, AlertCircle, MoreVertical } from 'lucide-react';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateTimePicker } from './DateTimePicker';
import { Priority, Tag, Todo, CustomTag, PredefinedTag } from '@/types/todo';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
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

const PRIORITY_INDICATORS: Record<Priority, string> = {
  low: 'border-l-priority-low',
  medium: 'border-l-priority-medium',
  high: 'border-l-priority-high',
};

const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'text-priority-low',
  medium: 'text-priority-medium',
  high: 'text-priority-high',
};

export const TodoItem = ({ todo, onUpdate, onDelete, customTags }: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [editPriority, setEditPriority] = useState(todo.priority);
  const [editDueDate, setEditDueDate] = useState(todo.dueDate);

  const isOverdue = todo.dueDate && !todo.completed && isBefore(todo.dueDate, startOfDay(new Date()));
  const isDueSoon = todo.dueDate && !todo.completed && !isOverdue && 
    isBefore(todo.dueDate, new Date(Date.now() + 24 * 60 * 60 * 1000)); // Due within 24 hours

  const handleSave = () => {
    if (!editTitle.trim()) return;
    
    onUpdate(todo.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      priority: editPriority,
      dueDate: editDueDate,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setEditPriority(todo.priority);
    setEditDueDate(todo.dueDate);
    setIsEditing(false);
  };

  const handleToggleComplete = () => {
    onUpdate(todo.id, { completed: !todo.completed });
  };

  if (isEditing) {
    return (
      <Card className={`border-l-4 ${PRIORITY_INDICATORS[editPriority]} transition-smooth`}>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="text-lg"
              placeholder="Todo title..."
            />
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description... (optional)"
              className="min-h-[60px]"
            />
            <div className="flex gap-2">
              <Select value={editPriority} onValueChange={(value: Priority) => setEditPriority(value)}>
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

              <DateTimePicker
                value={editDueDate}
                onChange={setEditDueDate}
                placeholder="Due date & time"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm" disabled={!editTitle.trim()}>
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`
        border-l-4 transition-smooth hover:shadow-md group
        ${PRIORITY_INDICATORS[todo.priority]}
        ${todo.completed ? 'opacity-75 bg-muted/30' : ''}
        ${isOverdue ? 'border-warning bg-warning/5' : ''}
        ${isDueSoon ? 'border-primary/50 bg-primary/5' : ''}
      `}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <Checkbox
            checked={todo.completed}
            onCheckedChange={handleToggleComplete}
            className="mt-1"
          />

          {/* Content */}
          <div className="flex-1 space-y-2">
            {/* Title and Priority */}
            <div className="flex items-start justify-between">
              <h3 
                className={`font-medium leading-tight ${
                  todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}
              >
                {todo.title}
              </h3>
              <div className="flex items-center gap-1">
                <AlertCircle className={`h-4 w-4 ${PRIORITY_COLORS[todo.priority]}`} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-smooth">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(todo.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Description */}
            {todo.description && (
              <p className={`text-sm ${
                todo.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'
              }`}>
                {todo.description}
              </p>
            )}

            {/* Tags and Due Date */}
            <div className="flex flex-wrap items-center gap-2">
            {/* Tags */}
            {todo.tags.map((tag) => (
              <Badge
                key={tag}
                className={`${getTagColor(tag, customTags)} text-xs capitalize`}
              >
                {tag}
              </Badge>
            ))}

            {/* Due Date */}
            {todo.dueDate && (
              <Badge 
                variant="outline"
                className={`text-xs gap-1 ${
                  isOverdue ? 'border-warning text-warning' :
                  isDueSoon ? 'border-primary text-primary' : ''
                }`}
              >
                <Calendar className="h-3 w-3" />
                {format(todo.dueDate, 'MMM dd \'at\' HH:mm')}
                {isOverdue && ' (Overdue)'}
                {isDueSoon && ' (Due soon)'}
              </Badge>
            )}
            </div>

            {/* Created/Updated timestamp */}
            <p className="text-xs text-muted-foreground">
              Created {format(todo.createdAt, 'MMM dd, yyyy')}
              {todo.updatedAt !== todo.createdAt && (
                <span> • Updated {format(todo.updatedAt, 'MMM dd, yyyy')}</span>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};