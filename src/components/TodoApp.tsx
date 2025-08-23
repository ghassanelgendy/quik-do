import { useState, useEffect, useMemo } from 'react';
import { isBefore, startOfDay } from 'date-fns';
import { AddTodo } from './AddTodo';
import { TodoList } from './TodoList';
import { FilterBar } from './FilterBar';
import { ProgressBar } from './ProgressBar';
import { Settings } from './Settings';
import { AuthButtons } from './AuthButtons';
import { Todo, FilterState, CustomTag } from '@/types/todo';
import { useToast } from '@/hooks/use-toast';
import * as todoApi from '@/api/todoApi';
import { useAuth } from '@/hooks/useAuth';
import { useDataSync } from '@/hooks/useDataSync';
import { FirstTimePrompt } from './FirstTimePrompt';
import { Cloud, Loader2 } from 'lucide-react';

export const TodoApp = () => {
  const { user } = useAuth();
  const { initializeData, isCloudEnabled } = useDataSync();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [customTags, setCustomTags] = useState<CustomTag[]>([]);
  const [showFirstTimePrompt, setShowFirstTimePrompt] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    showCompleted: true,
    showOverdue: false,
    selectedTags: [],
  });
  const { toast } = useToast();

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  // Check if this is the first time user visits the app
  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem('hasSeenFirstTimePrompt');
    if (!hasSeenPrompt) {
      setShowFirstTimePrompt(true);
    }
  }, []);

  // Load todos and custom tags on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        if (isCloudEnabled() && user) {
          // Show sync indicator
          setIsSyncing(true);
          
          // Load from cloud API (after sync is complete)
          console.log('📥 Loading data from cloud after sync...');
          const [cloudTodos, cloudTags] = await Promise.all([
            todoApi.getTodos(),
            todoApi.getCustomTags(),
          ]);
          const normalizedTodos = Array.isArray(cloudTodos)
            ? cloudTodos.map((todo: any) => ({
                ...todo,
                createdAt: new Date(todo.createdAt),
                updatedAt: new Date(todo.updatedAt),
                dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
              }))
            : [];
          const normalizedTags = Array.isArray(cloudTags)
            ? cloudTags.map((tag: any) => ({
                ...tag,
                createdAt: new Date(tag.createdAt),
              }))
            : [];
          setTodos(normalizedTodos);
          setCustomTags(normalizedTags);
          
          // Hide sync indicator
          setIsSyncing(false);
        } else {
          // Load from localStorage
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
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [user, isCloudEnabled]);

  // Initialize data when user changes
  useEffect(() => {
    initializeData();
  }, [user, initializeData]);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Save custom tags to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('custom-tags', JSON.stringify(customTags));
  }, [customTags]);

  // Custom tag management
  const handleAddCustomTag = async (tagData: Omit<CustomTag, 'id' | 'createdAt'>) => {
    try {
      const newTag = await todoApi.createCustomTag(tagData);
      setCustomTags(prev => [...prev, newTag]);
    } catch (error) {
      console.error('Add tag failed:', error);
    }
  };

  const handleUpdateCustomTag = async (id: string, updates: Partial<CustomTag>) => {
    try {
      const updatedTag = await todoApi.updateCustomTag(id, updates);
      setCustomTags(prev => prev.map(tag => tag.id === id ? updatedTag : tag));
    } catch (error) {
      console.error('Update tag failed:', error);
    }
  };

  const handleDeleteCustomTag = async (id: string) => {
    const tag = customTags.find(t => t.id === id);
    if (!tag) return;

    try {
      await todoApi.deleteCustomTag(id);
      
      // Remove this tag from all todos
      setTodos(prev => prev.map(todo => ({
        ...todo,
        tags: todo.tags.filter(t => t !== tag.name),
        updatedAt: new Date(),
      })));

      // Remove the custom tag
      setCustomTags(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Delete tag failed:', error);
    }
  };



  // Add new todo
  const handleAddTodo = async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTodo = await todoApi.createTodo(todoData);
      setTodos(prev => [newTodo, ...prev]);
      toast({ title: "Todo created!", description: `"${newTodo.title}" has been added to your list.` });
    } catch (error) {
      console.error('Add todo failed:', error);
      toast({ title: 'Failed to create todo', description: 'Please try again.', variant: 'destructive' });
    }
  };

  // Update todo
  const handleUpdateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const updatedTodo = await todoApi.updateTodo(id, updates);
      setTodos(prev => prev.map(todo => todo.id === id ? updatedTodo : todo));

      if (updates.completed !== undefined) {
        const todo = todos.find(t => t.id === id);
        if (todo) {
          toast({
            title: updates.completed ? "Todo completed!" : "Todo reopened",
            description: `"${todo.title}" has been ${updates.completed ? 'completed' : 'reopened'}.`,
          });
        }
      }
    } catch (error) {
      console.error('Update todo failed:', error);
      toast({ title: 'Failed to update todo', description: 'Please try again.', variant: 'destructive' });
    }
  };

  // Delete todo
  const handleDeleteTodo = async (id: string) => {
    try {
      const toRemove = todos.find(t => t.id === id);
      await todoApi.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
      if (toRemove) {
        toast({ title: "Todo deleted", description: `"${toRemove.title}" has been removed from your list.`, variant: "destructive" });
      }
    } catch (error) {
      console.error('Delete todo failed:', error);
      toast({ title: 'Failed to delete todo', description: 'Please try again.', variant: 'destructive' });
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

  // Handle first-time user preference
  const handlePreferenceSet = (preferCloud: boolean) => {
    setShowFirstTimePrompt(false);
    // Reload data based on new preference
    initializeData();
  };

  // Calculate progress
  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
		<div className="min-h-screen bg-gradient-subtle">
			<FirstTimePrompt
				isOpen={showFirstTimePrompt}
				onClose={() => setShowFirstTimePrompt(false)}
				onPreferenceSet={handlePreferenceSet}
			/>
			<div className="container mx-auto px-4 py-8 max-w-4xl">
				{/* Header */}
				<header className="flex items-center justify-between mb-8">
					<div className="flex items-center gap-3">
						<div className="flex-shrink-0">
							<img 
								src="/icon.png" 
								alt="Quik-do logo" 
								className="h-12 w-12 object-contain" 
							/>
						</div>
						<div className="min-w-0">
							<h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">Quik-do</h1>
							<p className="text-sm sm:text-base text-muted-foreground">Let it happen</p>
							{user && (
								<p className="text-xs sm:text-sm text-primary font-medium mt-1">
									Good {getTimeGreeting()}, {user.displayName || user.email?.split('@')[0] || 'User'}
								</p>
							)}
						</div>
					</div>
					<div className="flex items-center gap-3">
						{isSyncing && (
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span>Syncing...</span>
							</div>
						)}
						{isCloudEnabled() && user && !isSyncing && (
							<div className="flex items-center gap-2 text-sm text-primary">
								<Cloud className="h-4 w-4" />
								<span>Cloud</span>
							</div>
						)}
						<AuthButtons />
						<Settings
							customTags={customTags}
							onAddCustomTag={handleAddCustomTag}
							onUpdateCustomTag={handleUpdateCustomTag}
							onDeleteCustomTag={handleDeleteCustomTag}
						/>
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
						<FilterBar
							filters={filters}
							onFiltersChange={setFilters}
							customTags={customTags}
						/>
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
					<p>
						Built with love by{" "}
						<a
							href="https://github.com/ghassanelgendy"
							className="text-primary hover:underline">
							Ghassan Elgendy
						</a>
					</p>
					<p className="mt-1">
						This project is open source and available on{" "}
						<a
							href="https://github.com/ghassanelgendy/quik-do"
							className="text-primary hover:underline">
							GitHub
						</a>
					</p>
				</footer>
			</div>
		</div>
	);
};