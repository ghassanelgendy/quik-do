import { useState, useEffect, useMemo } from 'react';
import { isBefore, startOfDay } from 'date-fns';
import { CheckSquare, Settings } from 'lucide-react';
import { AddTodo } from './AddTodo';
import { TodoList } from './TodoList';
import { FilterBar } from './FilterBar';
import { ProgressBar } from './ProgressBar';
import { ThemeToggle } from './ThemeToggle';
import { ThemeSelector } from './ThemeSelector';
import { TagManager } from './TagManager';
import { Todo, FilterState, CustomTag } from '@/types/todo';
import { useToast } from '@/hooks/use-toast';

export const TodoApp = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [customTags, setCustomTags] = useState<CustomTag[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    showCompleted: true,
    showOverdue: false,
    selectedTags: [],
  });
  const { toast } = useToast();

  // Load todos and custom tags from localStorage on mount
  useEffect(() => {
    // Load todos
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      try {
        const parsed = JSON.parse(storedTodos);
        const todosWithDates = parsed.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt),
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        }));
        setTodos(todosWithDates);
      } catch (error) {
        console.error('Error loading todos:', error);
      }
    }

    // Load custom tags
    const storedTags = localStorage.getItem('custom-tags');
    if (storedTags) {
      try {
        const parsed = JSON.parse(storedTags);
        const tagsWithDates = parsed.map((tag: any) => ({
          ...tag,
          createdAt: new Date(tag.createdAt),
        }));
        setCustomTags(tagsWithDates);
      } catch (error) {
        console.error('Error loading custom tags:', error);
      }
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Save custom tags to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('custom-tags', JSON.stringify(customTags));
  }, [customTags]);

  // Custom tag management
  const handleAddCustomTag = (tagData: Omit<CustomTag, 'id' | 'createdAt'>) => {
    const newTag: CustomTag = {
      ...tagData,
      id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };
    setCustomTags(prev => [...prev, newTag]);
  };

  const handleUpdateCustomTag = (id: string, updates: Partial<CustomTag>) => {
    setCustomTags(prev => prev.map(tag =>
      tag.id === id ? { ...tag, ...updates } : tag
    ));
  };

  const handleDeleteCustomTag = (id: string) => {
    const tag = customTags.find(t => t.id === id);
    if (!tag) return;

    // Remove this tag from all todos
    setTodos(prev => prev.map(todo => ({
      ...todo,
      tags: todo.tags.filter(t => t !== tag.name),
      updatedAt: new Date(),
    })));

    // Remove the custom tag
    setCustomTags(prev => prev.filter(t => t.id !== id));
  };

  // Generate ID helper
  const generateId = () => `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add new todo
  const handleAddTodo = (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newTodo: Todo = {
      ...todoData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    
    setTodos(prev => [newTodo, ...prev]);
    toast({
      title: "Todo created!",
      description: `"${newTodo.title}" has been added to your list.`,
    });
  };

  // Update todo
  const handleUpdateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id 
        ? { ...todo, ...updates, updatedAt: new Date() }
        : todo
    ));
    
    if (updates.completed !== undefined) {
      const todo = todos.find(t => t.id === id);
      if (todo) {
        toast({
          title: updates.completed ? "Todo completed!" : "Todo reopened",
          description: `"${todo.title}" has been ${updates.completed ? 'completed' : 'reopened'}.`,
        });
      }
    }
  };

  // Delete todo
  const handleDeleteTodo = (id: string) => {
    const todo = todos.find(t => t.id === id);
    setTodos(prev => prev.filter(todo => todo.id !== id));
    
    if (todo) {
      toast({
        title: "Todo deleted",
        description: `"${todo.title}" has been removed from your list.`,
        variant: "destructive",
      });
    }
  };

  // Filter todos based on current filters
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          todo.title.toLowerCase().includes(searchLower) ||
          (todo.description && todo.description.toLowerCase().includes(searchLower)) ||
          todo.tags.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Completed filter
      if (!filters.showCompleted && todo.completed) return false;

      // Overdue filter
      if (filters.showOverdue) {
        const isOverdue = todo.dueDate && !todo.completed && 
          isBefore(todo.dueDate, startOfDay(new Date()));
        if (!isOverdue) return false;
      }

      // Tag filter
      if (filters.selectedTags.length > 0) {
        const hasMatchingTag = filters.selectedTags.some(tag => todo.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }, [todos, filters]);

  // Calculate progress
  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <CheckSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Todos</h1>
              <p className="text-muted-foreground">Stay organized and productive</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TagManager 
              customTags={customTags}
              onAddCustomTag={handleAddCustomTag}
              onUpdateCustomTag={handleUpdateCustomTag}
              onDeleteCustomTag={handleDeleteCustomTag}
            />
            <ThemeSelector />
            <ThemeToggle />
          </div>
        </header>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="mb-6">
            <ProgressBar completed={completedCount} total={totalCount} />
          </div>
        )}

        {/* Add Todo */}
        <div className="mb-6">
          <AddTodo onAdd={handleAddTodo} customTags={customTags} />
        </div>

        {/* Filters */}
        {totalCount > 0 && (
          <div className="mb-6">
            <FilterBar filters={filters} onFiltersChange={setFilters} customTags={customTags} />
          </div>
        )}

        {/* Todo List */}
        <main>
          <TodoList 
            todos={filteredTodos}
            onUpdate={handleUpdateTodo}
            onDelete={handleDeleteTodo}
            customTags={customTags}
          />
          
          {/* Results summary */}
          {totalCount > 0 && filteredTodos.length !== totalCount && (
            <div className="text-center mt-6 text-sm text-muted-foreground">
              Showing {filteredTodos.length} of {totalCount} todos
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-muted-foreground">
          <p>Built with React, TypeScript, and Tailwind CSS</p>
          <p className="mt-1">Ready for AWS deployment with API Gateway, Lambda, and DynamoDB</p>
        </footer>
      </div>
    </div>
  );
};