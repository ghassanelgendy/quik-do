import { useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { Todo, CustomTag } from '@/types/todo';
import * as todoApi from '@/api/todoApi';

/**
 * Hook for managing data synchronization between local storage and cloud API
 * 
 * When user prefers offline: Uses localStorage only
 * When user prefers cloud: Uses AWS API with localStorage fallback
 * When user logs out: Keeps data in localStorage
 * When user logs in: Syncs local data to cloud after validation
 */

export const useDataSync = () => {
  const { user } = useAuth();

  // Check if user prefers cloud storage
  const isCloudEnabled = useCallback(() => {
    return localStorage.getItem('preferCloud') === 'true';
  }, []);

  // Validate local data before syncing to cloud
  const validateLocalData = useCallback((todos: Todo[], tags: CustomTag[]): boolean => {
    try {
      // Basic validation for todos
      const validTodos = todos.every(todo => 
        todo.id && 
        todo.title && 
        typeof todo.completed === 'boolean' &&
        Array.isArray(todo.tags) &&
        todo.createdAt instanceof Date &&
        todo.updatedAt instanceof Date
      );

      // Basic validation for tags
      const validTags = tags.every(tag => 
        tag.id && 
        tag.name && 
        tag.color &&
        tag.createdAt instanceof Date
      );

      return validTodos && validTags;
    } catch (error) {
      console.error('Local data validation failed:', error);
      return false;
    }
  }, []);

  // Sync local data to cloud after validation
  const syncLocalToCloud = useCallback(async () => {
    if (!user || !isCloudEnabled()) return;

    try {
      console.log('🔄 Starting secure local-to-cloud sync...');

      // Get local data
      const localTodos = todoApi.getTodosFromStorage();
      const localTags = todoApi.getTagsFromStorage();

      // Validate local data
      if (!validateLocalData(localTodos, localTags)) {
        console.warn('⚠️ Local data validation failed, skipping sync');
        return;
      }

      console.log(`✅ Local data validated: ${localTodos.length} todos, ${localTags.length} tags`);

      // Get cloud data for comparison (normalize shapes and dates)
      const cloudTodosRaw = await todoApi.getTodos();
      const cloudTagsRaw = await todoApi.getCustomTags();
      const cloudTodos = (Array.isArray(cloudTodosRaw) ? cloudTodosRaw : []).map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
        dueDate: t?.dueDate ? new Date(t.dueDate) : undefined,
      }));
      const cloudTags = (Array.isArray(cloudTagsRaw) ? cloudTagsRaw : []).map((tg: any) => ({
        ...tg,
        createdAt: new Date(tg.createdAt),
      }));

      // Sync todos with conflict resolution (last write wins)
      for (const localTodo of localTodos) {
        const cloudTodo = cloudTodos.find((ct: Todo) => ct.id === localTodo.id);
        
        if (!cloudTodo || localTodo.updatedAt > cloudTodo.updatedAt) {
          console.log(`📤 Syncing todo: ${localTodo.title}`);
          await todoApi.updateTodo(localTodo.id, localTodo);
        }
      }

      // Sync tags with conflict resolution
      for (const localTag of localTags) {
        const cloudTag = cloudTags.find((ct: CustomTag) => ct.id === localTag.id);

        if (!cloudTag) {
          // Only create if not already uploaded
          if (localTag.uploaded) {
            console.log(`⏭️ Skipping cloud create for already-uploaded tag: ${localTag.name}`);
            continue;
          }

          console.log(`📤 Creating cloud tag: ${localTag.name}`);
          const created = await todoApi.createCustomTag({ name: localTag.name, color: localTag.color });
          // Update local storage with new cloud id and mark uploaded
          try {
            const currentLocalTags = todoApi.getTagsFromStorage();
            const updatedLocalTags = currentLocalTags.map(t =>
              t.id === localTag.id
                ? { ...t, id: created.id, createdAt: new Date(created.createdAt), uploaded: true }
                : t
            );
            localStorage.setItem('custom-tags', JSON.stringify(updatedLocalTags));
          } catch (e) {
            console.warn('Failed to update local tags with cloud id', e);
          }
          continue;
        }

        if (localTag.createdAt > cloudTag.createdAt) {
          console.log(`📤 Updating cloud tag: ${localTag.name}`);
          await todoApi.updateCustomTag(localTag.id, { name: localTag.name, color: localTag.color });
        }
      }

      console.log('✅ Local-to-cloud sync completed');
    } catch (error) {
      console.error('❌ Local-to-cloud sync failed:', error);
    }
  }, [user, isCloudEnabled, validateLocalData]);

  // Initialize data when user changes or preference changes
  const initializeData = useCallback(async () => {
    try {
      console.log('Initializing data...');
      
      if (isCloudEnabled() && user) {
        console.log('☁️ User logged in with cloud sync enabled');
        
        // First, sync local data to cloud (after validation)
        await syncLocalToCloud();
        
        // Then fetch latest data from cloud
        console.log('📥 Fetching latest data from cloud...');
        // Data will be loaded by the TodoApp component using the API
      } else {
        console.log('💾 Loading data from localStorage...');
        // Data will be loaded by the TodoApp component from localStorage
      }
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  }, [user, isCloudEnabled, syncLocalToCloud]);

  // Effect to initialize data when user changes
  useEffect(() => {
    initializeData();
  }, [user, initializeData]);

  return {
    initializeData,
    isCloudEnabled,
    syncLocalToCloud,
  };
};
