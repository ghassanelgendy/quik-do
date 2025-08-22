# AWS Integration Guide for Quik-do

## Overview
This guide explains how to set up the AWS backend infrastructure for the Quik-do todo application.

## Architecture
```
Firebase Auth → React App → API Gateway → Lambda Functions → DynamoDB
```

## 1. Environment Setup

Create a `.env.local` file in your project root:
```bash
# AWS API Configuration
VITE_API_BASE_URL=https://your-api-gateway-id.execute-api.your-region.amazonaws.com/prod
```

## 2. DynamoDB Tables

### Table 1: user_todos
```
Partition Key: user_id (String) - Firebase UID
Sort Key: todo_id (String) - UUID v4

Attributes:
- title (String)
- description (String, optional)
- completed (Boolean)
- priority (String: 'low' | 'medium' | 'high')
- tags (List)
- due_date (String, ISO format, optional)
- created_at (String, ISO format)
- updated_at (String, ISO format)
```

### Table 2: user_tags
```
Partition Key: user_id (String) - Firebase UID
Sort Key: tag_id (String) - UUID v4

Attributes:
- name (String)
- color (String) - CSS class name
- created_at (String, ISO format)
```

## 3. Lambda Functions Required

### Authentication Helper
All Lambda functions need to validate Firebase JWT tokens:

```javascript
const admin = require('firebase-admin');

// Initialize Firebase Admin (do this once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      // Your Firebase service account key
    })
  });
}

async function validateToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid authorization header');
  }
  
  const token = authHeader.substring(7);
  const decodedToken = await admin.auth().verifyIdToken(token);
  return decodedToken.uid; // This is your user_id
}
```

### 1. GET /todos
```javascript
exports.handler = async (event) => {
  try {
    const userId = await validateToken(event.headers.Authorization);
    
    const params = {
      TableName: 'user_todos',
      KeyConditionExpression: 'user_id = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false // Sort by sort key descending
    };
    
    const result = await dynamoDB.query(params).promise();
    
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(result.Items)
    };
  } catch (error) {
    return {
      statusCode: 401,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

### 2. POST /todos
```javascript
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  try {
    const userId = await validateToken(event.headers.Authorization);
    const todoData = JSON.parse(event.body);
    
    const todoId = uuidv4();
    const now = new Date().toISOString();
    
    const item = {
      user_id: userId,
      todo_id: todoId,
      title: todoData.title,
      description: todoData.description || '',
      completed: false,
      priority: todoData.priority || 'medium',
      tags: todoData.tags || [],
      due_date: todoData.dueDate || null,
      created_at: now,
      updated_at: now
    };
    
    await dynamoDB.put({
      TableName: 'user_todos',
      Item: item
    }).promise();
    
    return {
      statusCode: 201,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ...item, id: todoId })
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

### 3. PUT /todos/{id}
```javascript
exports.handler = async (event) => {
  try {
    const userId = await validateToken(event.headers.Authorization);
    const todoId = event.pathParameters.id;
    const updates = JSON.parse(event.body);
    
    // Build update expression dynamically
    let updateExpression = 'SET updated_at = :now';
    let expressionAttributeValues = { ':now': new Date().toISOString() };
    
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
        updateExpression += `, ${key} = :${key}`;
        expressionAttributeValues[`:${key}`] = updates[key];
      }
    });
    
    const params = {
      TableName: 'user_todos',
      Key: { user_id: userId, todo_id: todoId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };
    
    const result = await dynamoDB.update(params).promise();
    
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ...result.Attributes, id: todoId })
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

### 4. DELETE /todos/{id}
```javascript
exports.handler = async (event) => {
  try {
    const userId = await validateToken(event.headers.Authorization);
    const todoId = event.pathParameters.id;
    
    await dynamoDB.delete({
      TableName: 'user_todos',
      Key: { user_id: userId, todo_id: todoId }
    }).promise();
    
    return {
      statusCode: 204,
      headers: { 'Access-Control-Allow-Origin': '*' }
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

### 5-8. Similar functions for /tags endpoints
Follow the same pattern for custom tags using the `user_tags` table.

## 4. API Gateway Setup

### Resource Structure:
```
/
├── /todos
│   ├── GET (List todos)
│   ├── POST (Create todo)
│   └── /{id}
│       ├── PUT (Update todo)
│       └── DELETE (Delete todo)
└── /tags
    ├── GET (List tags)
    ├── POST (Create tag)
    └── /{id}
        ├── PUT (Update tag)
        └── DELETE (Delete tag)
```

### CORS Configuration:
Enable CORS for all methods with:
- Access-Control-Allow-Origin: * (or your domain)
- Access-Control-Allow-Headers: Content-Type,Authorization
- Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS

## 5. Firebase Service Account

1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate a new private key
3. Add the JSON key to your Lambda environment variables or AWS Secrets Manager
4. Use it to initialize Firebase Admin SDK in your Lambda functions

## 6. Frontend Integration

The frontend is already set up to:
- Store Firebase JWT tokens automatically
- Use API when user is authenticated
- Fall back to localStorage when offline or unauthenticated
- Sync local data to remote when user logs in

## 7. Testing

1. Test with unauthenticated user (should use localStorage)
2. Register/login user (should sync data to DynamoDB)
3. Test CRUD operations (should work with API)
4. Test logout (should keep local data)

## 8. Security Considerations

- Always validate Firebase tokens in Lambda
- Use least privilege IAM roles for Lambda functions
- Enable CloudWatch logging for debugging
- Consider rate limiting in API Gateway
- Validate input data in Lambda functions

## 9. Cost Optimization

- Use DynamoDB On-Demand pricing for variable workloads
- Consider Lambda provisioned concurrency for consistent performance
- Set up CloudWatch alarms for cost monitoring
- Use API Gateway caching for read operations if needed

## Next Steps

1. Create the DynamoDB tables
2. Set up Lambda functions with the provided code
3. Configure API Gateway with proper routing
4. Update the `VITE_API_BASE_URL` environment variable
5. Test the integration end-to-end
