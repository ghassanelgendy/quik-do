import { Todo, CustomTag } from '../types/todo';

// API Configuration - Replace with your AWS API Gateway URL
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://your-api-gateway-url.amazonaws.com/prod';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
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
    // Lambda function should:
    // 1. Validate Firebase JWT token from Authorization header
    // 2. Extract user_id from token payload
    // 3. Query DynamoDB with user_id as partition key
    // 4. Transform DynamoDB items to Todo objects with proper date parsing
    // 5. Return sorted by createdAt desc
    
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error(`Failed to fetch todos: ${response.status}`);
    }

    const todos = await response.json();
    
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

// POST /todos - Create a new todo
export const createTodo = async (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo> => {
  try {
    // Lambda function should:
    // 1. Validate Firebase JWT token and extract user_id
    // 2. Validate request body against schema
    // 3. Generate unique todo_id (UUID v4)
    // 4. Add timestamps (createdAt, updatedAt) as ISO strings
    // 5. Store in DynamoDB: PK=user_id, SK=todo_id
    // 6. Return the created todo with proper structure
    
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...todo,
        // Convert Date objects to ISO strings for DynamoDB
        dueDate: todo.dueDate?.toISOString(),
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error(`Failed to create todo: ${response.status}`);
    }

    const createdTodo = await response.json();
    
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

// PUT /todos/:id - Update an existing todo
export const updateTodo = async (id: string, updates: Partial<Todo>): Promise<Todo> => {
  try {
    // Lambda function should:
    // 1. Validate Firebase JWT token and extract user_id
    // 2. Verify todo exists and belongs to user (PK=user_id, SK=todo_id)
    // 3. Update only provided fields in DynamoDB
    // 4. Set updatedAt timestamp automatically
    // 5. Return updated todo
    
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...updates,
        // Convert Date objects to ISO strings
        dueDate: updates.dueDate?.toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      if (response.status === 404) {
        throw new Error('Todo not found');
      }
      throw new Error(`Failed to update todo: ${response.status}`);
    }

    const updatedTodo = await response.json();
    
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

// DELETE /todos/:id - Delete a todo
export const deleteTodo = async (id: string): Promise<void> => {
  try {
    // Lambda function should:
    // 1. Validate Firebase JWT token and extract user_id
    // 2. Verify todo exists and belongs to user
    // 3. Remove item from DynamoDB
    // 4. Return 204 No Content on success
    
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      if (response.status === 404) {
        throw new Error('Todo not found');
      }
      throw new Error(`Failed to delete todo: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};

// Custom Tags API Functions

// GET /tags - Retrieve all custom tags for authenticated user
export const getCustomTags = async (): Promise<CustomTag[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tags`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error(`Failed to fetch tags: ${response.status}`);
    }

    const tags = await response.json();
    
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
    const response = await fetch(`${API_BASE_URL}/tags`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tag),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error(`Failed to create tag: ${response.status}`);
    }

    const createdTag = await response.json();
    
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
    const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      if (response.status === 404) {
        throw new Error('Tag not found');
      }
      throw new Error(`Failed to update tag: ${response.status}`);
    }

    const updatedTag = await response.json();
    
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
    const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      if (response.status === 404) {
        throw new Error('Tag not found');
      }
      throw new Error(`Failed to delete tag: ${response.status}`);
    }
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