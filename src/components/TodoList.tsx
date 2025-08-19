import { TodoItem } from './TodoItem';
import { Todo, CustomTag } from '@/types/todo';

interface TodoListProps {
  todos: Todo[];
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
  customTags: CustomTag[];
}

export const TodoList = ({ todos, onUpdate, onDelete, customTags }: TodoListProps) => {
  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium mb-2">No todos found</p>
          <p className="text-sm">Create your first todo to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onUpdate={onUpdate}
          onDelete={onDelete}
          customTags={customTags}
        />
      ))}
    </div>
  );
};