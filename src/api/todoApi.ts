import { Todo } from '../types/todo';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.example.com';

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
    // In production, this would call: GET ${API_BASE_URL}/todos
    // Lambda function would:
    // 1. Validate JWT token from Authorization header
    // 2. Query DynamoDB with user_id as partition key
    // 3. Transform DynamoDB items to Todo objects
    // 4. Return sorted by createdAt
    
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching todos:', error);
    // For now, return empty array. In production, handle this appropriately
    return [];
  }
};

// POST /todos - Create a new todo
export const createTodo = async (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo> => {
  try {
    // In production, this would call: POST ${API_BASE_URL}/todos
    // Lambda function would:
    // 1. Validate JWT token and request body
    // 2. Generate unique ID (UUID)
    // 3. Add timestamps (createdAt, updatedAt)
    // 4. Store in DynamoDB with user_id + todo_id as composite key
    // 5. Return the created todo
    
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify(todo),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating todo:', error);
    throw error;
  }
};

// PUT /todos/:id - Update an existing todo
export const updateTodo = async (id: string, updates: Partial<Todo>): Promise<Todo> => {
  try {
    // In production, this would call: PUT ${API_BASE_URL}/todos/${id}
    // Lambda function would:
    // 1. Validate JWT token and ownership
    // 2. Update only provided fields in DynamoDB
    // 3. Set updatedAt timestamp
    // 4. Return updated todo
    
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({ ...updates, updatedAt: new Date() }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
};

// DELETE /todos/:id - Delete a todo
export const deleteTodo = async (id: string): Promise<void> => {
  try {
    // In production, this would call: DELETE ${API_BASE_URL}/todos/${id}
    // Lambda function would:
    // 1. Validate JWT token and ownership
    // 2. Remove item from DynamoDB
    // 3. Return 204 No Content on success
    
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};

/**
 * DynamoDB Table Structure Example:
 * 
 * Table: todos
 * Partition Key: user_id (String)
 * Sort Key: todo_id (String)
 * 
 * Attributes:
 * - title (String)
 * - description (String, optional)
 * - completed (Boolean)
 * - priority (String: 'low' | 'medium' | 'high')
 * - tags (StringSet)
 * - due_date (String, ISO format, optional)
 * - created_at (String, ISO format)
 * - updated_at (String, ISO format)
 * 
 * Global Secondary Indexes:
 * - GSI1: due_date (for querying overdue items)
 * - GSI2: priority (for priority-based queries)
 */