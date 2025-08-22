import { useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { Todo, CustomTag } from '@/types/todo';
import * as todoApi from '@/api/todoApi';

/**
 * Hook for managing data synchronization between local storage and remote API
 * 
 * When user is not authenticated: Uses localStorage only
 * When user authenticates: Syncs localStorage data to remote API
 * When user logs out: Keeps data in localStorage
 * 
 * This provides a seamless experience where guests can use the app offline,
 * and their data gets synced when they decide to sign up.
 */

export const useDataSync = () => {
  const { user, authToken } = useAuth();

  // Sync local data to remote when user logs in
  const syncLocalToRemote = useCallback(async () => {
    if (!user || !authToken) return;

    try {
      console.log('Syncing local data to remote...');

      // Get local data
      const localTodos = localStorage.getItem('todos');
      const localTags = localStorage.getItem('custom-tags');

      // Sync todos
      if (localTodos) {
        const todos: Todo[] = JSON.parse(localTodos).map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt),
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        }));

        // First, get existing remote todos to avoid duplicates
        let remoteTodos: Todo[] = [];
        try {
          remoteTodos = await todoApi.getTodos();
        } catch (error) {
          console.log('No existing remote todos, proceeding with sync');
        }

        // Sync each local todo that doesn't exist remotely
        for (const todo of todos) {
          const exists = remoteTodos.some(remote => remote.id === todo.id);
          if (!exists) {
            try {
              await todoApi.createTodo({
                title: todo.title,
                description: todo.description,
                completed: todo.completed,
                priority: todo.priority,
                tags: todo.tags,
                dueDate: todo.dueDate,
              });
            } catch (error) {
              console.error('Failed to sync todo:', todo.id, error);
            }
          }
        }
      }

      // Sync custom tags
      if (localTags) {
        const tags: CustomTag[] = JSON.parse(localTags).map((tag: any) => ({
          ...tag,
          createdAt: new Date(tag.createdAt),
        }));

        // First, get existing remote tags to avoid duplicates
        let remoteTags: CustomTag[] = [];
        try {
          remoteTags = await todoApi.getCustomTags();
        } catch (error) {
          console.log('No existing remote tags, proceeding with sync');
        }

        // Sync each local tag that doesn't exist remotely
        for (const tag of tags) {
          const exists = remoteTags.some(remote => remote.id === tag.id);
          if (!exists) {
            try {
              await todoApi.createCustomTag({
                name: tag.name,
                color: tag.color,
              });
            } catch (error) {
              console.error('Failed to sync tag:', tag.id, error);
            }
          }
        }
      }

      console.log('Local data sync completed');
    } catch (error) {
      console.error('Error syncing local data to remote:', error);
    }
  }, [user, authToken]);

  // Load remote data and merge with local when user logs in
  const loadRemoteData = useCallback(async () => {
    if (!user || !authToken) return { todos: [], customTags: [] };

    try {
      console.log('Loading remote data...');
      
      const [remoteTodos, remoteTags] = await Promise.all([
        todoApi.getTodos().catch(() => []),
        todoApi.getCustomTags().catch(() => []),
      ]);

      console.log('Remote data loaded:', { todos: remoteTodos.length, tags: remoteTags.length });
      
      return {
        todos: remoteTodos,
        customTags: remoteTags,
      };
    } catch (error) {
      console.error('Error loading remote data:', error);
      return { todos: [], customTags: [] };
    }
  }, [user, authToken]);

  // Save data to appropriate storage (local or remote)
  const saveData = useCallback(async (
    type: 'todo' | 'customTag',
    operation: 'create' | 'update' | 'delete',
    data: any,
    id?: string
  ) => {
    if (user && authToken) {
      // User is authenticated, save to remote API
      try {
        switch (type) {
          case 'todo':
            switch (operation) {
              case 'create':
                return await todoApi.createTodo(data);
              case 'update':
                return await todoApi.updateTodo(id!, data);
              case 'delete':
                await todoApi.deleteTodo(id!);
                return;
            }
            break;
          case 'customTag':
            switch (operation) {
              case 'create':
                return await todoApi.createCustomTag(data);
              case 'update':
                return await todoApi.updateCustomTag(id!, data);
              case 'delete':
                await todoApi.deleteCustomTag(id!);
                return;
            }
            break;
        }
      } catch (error) {
        console.error(`Error ${operation} ${type} remotely:`, error);
        throw error;
      }
    }
    // If not authenticated or API fails, data will be saved to localStorage by the calling component
  }, [user, authToken]);

  // Check if user is authenticated and can use remote API
  const isRemoteEnabled = useCallback(() => {
    return !!(user && authToken);
  }, [user, authToken]);

  return {
    syncLocalToRemote,
    loadRemoteData,
    saveData,
    isRemoteEnabled,
  };
};
