import { Todo, CustomTag } from '../types/todo';
import { auth } from '@/lib/firebase';

// API Configuration - use provided test base URL by default
// In Vite, env vars are accessed via import.meta.env and must be prefixed with VITE_
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'https://pcuygumkf6.execute-api.eu-west-1.amazonaws.com/test';

// Retrieve a valid Firebase ID token, optionally forcing a refresh
const getToken = async (forceRefresh = false): Promise<string | null> => {
  const existing = sessionStorage.getItem('authToken');
  if (existing && !forceRefresh) return existing;

  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const token = await currentUser.getIdToken(forceRefresh);
  if (token) sessionStorage.setItem('authToken', token);
  return token || null;
};

// Centralized request helper with auth and error handling (with single retry on 401/403)
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

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
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
        if (body?.message) message = body.message;
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

/**
 * AWS Integration Notes:
 * 
 * These functions are designed to work with:
 * 1. API Gateway - Exposes REST endpoints
 * 2. AWS Lambda - Serverless functions for CRUD operations
 * 3. DynamoDB - NoSQL database for todo persistence
 * 
 * Architecture:
 * - API Gateway routes to Lambda functions
 * - Lambda functions interact with DynamoDB
 * - Each function handles authentication, validation, and data transformation
 */

// GET /todos - Retrieve all todos for authenticated user
export const getTodos = async (): Promise<Todo[]> => {
  try {
    const todos = await apiRequest(`/todos`, { method: 'GET' });
    
    // Transform date strings back to Date objects
    return todos.map((todo: any) => ({
      ...todo,
      createdAt: new Date(todo.createdAt),
      updatedAt: new Date(todo.updatedAt),
      dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
    }));
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
};

// PUT /todos - Create or update todo (server decides based on id presence)
export const createTodo = async (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo> => {
  try {
    const createdTodo = await apiRequest(`/todos`, {
      method: 'PUT',
      body: JSON.stringify({
        ...todo,
        dueDate: todo.dueDate?.toISOString(),
      }),
    });
    
    // Transform response back to proper Date objects
    return {
      ...createdTodo,
      createdAt: new Date(createdTodo.createdAt),
      updatedAt: new Date(createdTodo.updatedAt),
      dueDate: createdTodo.dueDate ? new Date(createdTodo.dueDate) : undefined,
    };
  } catch (error) {
    console.error('Error creating todo:', error);
    throw error;
  }
};

// PUT /todos - Update an existing todo (id required in body)
export const updateTodo = async (id: string, updates: Partial<Todo>): Promise<Todo> => {
  try {
    const updatedTodo = await apiRequest(`/todos`, {
      method: 'PUT',
      body: JSON.stringify({
        id,
        ...updates,
        dueDate: updates.dueDate?.toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });
    
    // Transform response back to proper Date objects
    return {
      ...updatedTodo,
      createdAt: new Date(updatedTodo.createdAt),
      updatedAt: new Date(updatedTodo.updatedAt),
      dueDate: updatedTodo.dueDate ? new Date(updatedTodo.dueDate) : undefined,
    };
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
};

// DELETE /todos/{id} - Delete a todo
export const deleteTodo = async (id: string): Promise<void> => {
  try {
    await apiRequest(`/todos/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};

// Custom Tags API Functions

// GET /tags - Retrieve all custom tags for authenticated user
export const getCustomTags = async (): Promise<CustomTag[]> => {
  try {
    const tags = await apiRequest(`/tags`, { method: 'GET' });
    
    // Transform date strings back to Date objects
    return tags.map((tag: any) => ({
      ...tag,
      createdAt: new Date(tag.createdAt),
    }));
  } catch (error) {
    console.error('Error fetching custom tags:', error);
    throw error;
  }
};

// POST /tags - Create a new custom tag
export const createCustomTag = async (tag: Omit<CustomTag, 'id' | 'createdAt'>): Promise<CustomTag> => {
  try {
    const createdTag = await apiRequest(`/tags`, {
      method: 'POST',
      body: JSON.stringify(tag),
    });
    
    return {
      ...createdTag,
      createdAt: new Date(createdTag.createdAt),
    };
  } catch (error) {
    console.error('Error creating custom tag:', error);
    throw error;
  }
};

// PUT /tags/:id - Update an existing custom tag
export const updateCustomTag = async (id: string, updates: Partial<CustomTag>): Promise<CustomTag> => {
  try {
    const updatedTag = await apiRequest(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    return {
      ...updatedTag,
      createdAt: new Date(updatedTag.createdAt),
    };
  } catch (error) {
    console.error('Error updating custom tag:', error);
    throw error;
  }
};

// DELETE /tags/:id - Delete a custom tag
export const deleteCustomTag = async (id: string): Promise<void> => {
  try {
    await apiRequest(`/tags/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting custom tag:', error);
    throw error;
  }
};

/**
 * DynamoDB Table Structures:
 * 
 * TABLE 1: user_todos
 * Partition Key: user_id (String) - Firebase UID
 * Sort Key: todo_id (String) - UUID v4
 * 
 * Attributes:
 * - title (String)
 * - description (String, optional)
 * - completed (Boolean)
 * - priority (String: 'low' | 'medium' | 'high')
 * - tags (List of Strings)
 * - due_date (String, ISO format, optional)
 * - created_at (String, ISO format)
 * - updated_at (String, ISO format)
 * 
 * Global Secondary Indexes:
 * - GSI1: due_date (for querying overdue items)
 * - GSI2: priority (for priority-based queries)
 * 
 * TABLE 2: user_tags
 * Partition Key: user_id (String) - Firebase UID
 * Sort Key: tag_id (String) - UUID v4
 * 
 * Attributes:
 * - name (String)
 * - color (String) - CSS class name
 * - created_at (String, ISO format)
 * 
 * LAMBDA FUNCTIONS NEEDED:
 * 1. GET /todos - Query user_todos table by user_id
 * 2. POST /todos - Create new todo in user_todos table
 * 3. PUT /todos/{todo_id} - Update specific todo
 * 4. DELETE /todos/{todo_id} - Delete specific todo
 * 5. GET /tags - Query user_tags table by user_id
 * 6. POST /tags - Create new tag in user_tags table
 * 7. PUT /tags/{tag_id} - Update specific tag
 * 8. DELETE /tags/{tag_id} - Delete specific tag
 * 
 * FIREBASE TOKEN VALIDATION:
 * - Use Firebase Admin SDK in Lambda to verify JWT tokens
 * - Extract user_id from token payload
 * - Ensure user can only access their own data
 */