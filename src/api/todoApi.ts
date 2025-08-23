import { Todo, CustomTag } from '../types/todo';
import { auth } from '@/lib/firebase';

// API Configuration
const API_BASE_URL = 'https://by489qc8yj.execute-api.eu-west-1.amazonaws.com/testing';

// Retrieve a valid Firebase ID token
const getToken = async (forceRefresh = false): Promise<string | null> => {
  const existing = sessionStorage.getItem('authToken');
  if (existing && !forceRefresh) return existing;

  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const token = await currentUser.getIdToken(forceRefresh);
  if (token) sessionStorage.setItem('authToken', token);
  return token || null;
};

// Centralized request helper with auth and error handling
const apiRequest = async (path: string, options: RequestInit = {}) => {
  const attempt = async (useRefreshedToken: boolean) => {
    const token = await getToken(useRefreshedToken);
    if (!token) {
      const error = new Error('Authentication required');
      (error as any).status = 401;
      throw error;
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      'Authorization': `Bearer ${token}`,
    } as HeadersInit;

    const url = `${API_BASE_URL}${path}`;
    const requestConfig = {
      ...options,
      headers,
    };

    // Log the request details
    console.log('🚀 API Request:', {
      url,
      method: requestConfig.method || 'GET',
      headers: Object.fromEntries(Object.entries(headers).map(([key, value]) => [key, key === 'Authorization' ? 'Bearer [REDACTED]' : value])),
      body: requestConfig.body ? JSON.parse(requestConfig.body as string) : undefined,
      timestamp: new Date().toISOString()
    });

    const response = await fetch(url, requestConfig);
    
    // Log the response details
    console.log('📥 API Response:', {
      url,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      timestamp: new Date().toISOString()
    });

    return response;
  };

  try {
    let response = await attempt(false);

    if (response.status === 401 || response.status === 403) {
      // Try once with a forced token refresh
      sessionStorage.removeItem('authToken');
      response = await attempt(true);
    }

    if (!response.ok) {
      let message = `Request failed: ${response.status}`;
      try {
        const body = await response.json();
        if (body?.error) message = body.error;
      } catch {}

      const err: any = new Error(message);
      err.status = response.status;
      throw err;
    }

    if (response.status === 204) return null;
    return await response.json();
  } catch (e: any) {
    if (e.name === 'TypeError') {
      // Network error
      throw new Error('Network error. Please check your connection.');
    }
    throw e;
  }
};

// Helper function to get todos from localStorage
export const getTodosFromStorage = (): Todo[] => {
  try {
    const todos = localStorage.getItem('todos');
    return todos ? JSON.parse(todos).map((todo: any) => ({
      ...todo,
      createdAt: new Date(todo.createdAt),
      updatedAt: new Date(todo.updatedAt),
      dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
    })) : [];
  } catch (error) {
    console.error('Error reading todos from localStorage:', error);
    return [];
  }
};

// Helper function to save todos to localStorage
const saveTodosToStorage = (todos: Todo[]): void => {
  try {
    localStorage.setItem('todos', JSON.stringify(todos));
  } catch (error) {
    console.error('Error saving todos to localStorage:', error);
  }
};

// Helper function to get tags from localStorage
export const getTagsFromStorage = (): CustomTag[] => {
  try {
    const tags = localStorage.getItem('custom-tags');
    return tags ? JSON.parse(tags).map((tag: any) => ({
      ...tag,
      createdAt: new Date(tag.createdAt),
    })) : [];
  } catch (error) {
    console.error('Error reading tags from localStorage:', error);
    return [];
  }
};

// Helper function to save tags to localStorage
const saveTagsToStorage = (tags: CustomTag[]): void => {
  try {
    localStorage.setItem('custom-tags', JSON.stringify(tags));
  } catch (error) {
    console.error('Error saving tags to localStorage:', error);
  }
};

// Check if user prefers cloud storage
const isCloudEnabled = (): boolean => {
  return localStorage.getItem('preferCloud') === 'true';
};

// GET /todos - Retrieve all todos
export const getTodos = async (): Promise<Todo[]> => {
  if (isCloudEnabled()) {
    try {
      return await apiRequest('/todos', { method: 'GET' });
    } catch (error) {
      console.error('Cloud fetch failed, falling back to local:', error);
      return getTodosFromStorage();
    }
  }
  return getTodosFromStorage();
};

// PUT /todos - Create or update todo
export const createTodo = async (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo> => {
  if (isCloudEnabled()) {
    try {
      return await apiRequest('/todos', {
        method: 'PUT',
        body: JSON.stringify({
          ...todo,
          dueDate: todo.dueDate?.toISOString(),
        }),
      });
    } catch (error) {
      console.error('Cloud create failed, falling back to local:', error);
    }
  }
  
  // Fallback to local
  const todos = getTodosFromStorage();
  const newTodo: Todo = {
    ...todo,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  todos.push(newTodo);
  saveTodosToStorage(todos);
  return newTodo;
};

// PUT /todos - Update an existing todo
export const updateTodo = async (id: string, updates: Partial<Todo>): Promise<Todo> => {
  if (isCloudEnabled()) {
    try {
      return await apiRequest('/todos', {
        method: 'PUT',
        body: JSON.stringify({
          id,
          ...updates,
          dueDate: updates.dueDate?.toISOString(),
        }),
      });
    } catch (error) {
      console.error('Cloud update failed, falling back to local:', error);
    }
  }
  
  // Fallback to local
  const todos = getTodosFromStorage();
  const index = todos.findIndex(todo => todo.id === id);
  
  if (index === -1) {
    throw new Error('Todo not found');
  }
  
  todos[index] = {
    ...todos[index],
    ...updates,
    updatedAt: new Date(),
  };
  
  saveTodosToStorage(todos);
  return todos[index];
};

// DELETE /todos/{id} - Delete a todo
export const deleteTodo = async (id: string): Promise<void> => {
  if (isCloudEnabled()) {
    try {
      await apiRequest(`/todos/${id}`, { method: 'DELETE' });
      return;
    } catch (error) {
      console.error('Cloud delete failed, falling back to local:', error);
    }
  }
  
  // Fallback to local
  const todos = getTodosFromStorage();
  const filteredTodos = todos.filter(todo => todo.id !== id);
  saveTodosToStorage(filteredTodos);
};

// Custom Tags API Functions

// GET /tags - Retrieve all custom tags
export const getCustomTags = async (): Promise<CustomTag[]> => {
  if (isCloudEnabled()) {
    try {
      console.log('Attempting to fetch tags from cloud...');

      // Check if user is authenticated
      const user = auth.currentUser;
      if (!user) {
        console.error('No authenticated user found');
        return getTagsFromStorage();
      }

      // Get token and log a small, non-sensitive portion
      const token = await user.getIdToken();
      console.log('Using token (first 10 chars):', token.substring(0, 10));

      const tags = await apiRequest('/tags', { method: 'GET' });
      console.log('Successfully fetched tags:', tags);
      return tags;
    } catch (error: any) {
      console.error('Cloud fetch tags failed, falling back to local:', error);
      console.error('Error details:', {
        message: error?.message,
        status: (error as any)?.status,
        stack: error?.stack,
      });
      return getTagsFromStorage();
    }
  }
  return getTagsFromStorage();
};

// POST /tags - Create a new custom tag
export const createCustomTag = async (tag: Omit<CustomTag, 'id' | 'createdAt'>): Promise<CustomTag> => {
  if (isCloudEnabled()) {
    try {
      return await apiRequest('/tags', {
        method: 'POST',
        body: JSON.stringify(tag),
      });
    } catch (error) {
      console.error('Cloud create tag failed, falling back to local:', error);
    }
  }
  
  // Fallback to local
  const tags = getTagsFromStorage();
  const newTag: CustomTag = {
    ...tag,
    id: crypto.randomUUID(),
    createdAt: new Date(),
  };
  
  tags.push(newTag);
  saveTagsToStorage(tags);
  return newTag;
};

// PUT /tags/:id - Update an existing custom tag
export const updateCustomTag = async (id: string, updates: Partial<CustomTag>): Promise<CustomTag> => {
  if (isCloudEnabled()) {
    try {
      return await apiRequest(`/tags/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Cloud update tag failed, falling back to local:', error);
    }
  }
  
  // Fallback to local
  const tags = getTagsFromStorage();
  const index = tags.findIndex(tag => tag.id === id);
  
  if (index === -1) {
    throw new Error('Tag not found');
  }
  
  tags[index] = {
    ...tags[index],
    ...updates,
  };
  
  saveTagsToStorage(tags);
  return tags[index];
};

// DELETE /tags/:id - Delete a custom tag
export const deleteCustomTag = async (id: string): Promise<void> => {
  if (isCloudEnabled()) {
    try {
      await apiRequest(`/tags/${id}`, { method: 'DELETE' });
      return;
    } catch (error) {
      console.error('Cloud delete tag failed, falling back to local:', error);
    }
  }
  
  // Fallback to local
  const tags = getTagsFromStorage();
  const filteredTags = tags.filter(tag => tag.id !== id);
  saveTagsToStorage(filteredTags);
};