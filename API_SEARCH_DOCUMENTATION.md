# Search API Documentation

## Overview
The Search API provides comprehensive search functionality across messages, users, and conversations within the social media platform. It supports both individual search endpoints and a global search that combines all search types.

## Base URL
```
/api/search
```

## Authentication
All search endpoints require authentication using Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Search Messages
Search for messages within user's conversations.

**Endpoint:** `GET /api/search/messages`

**Query Parameters:**
- `query` (required): Search term (minimum 1 character)
- `conversationId` (optional): Specific conversation ID to search within
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of results per page (default: 20)

**Example Request:**
```http
GET /api/search/messages?query=hello&page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**
```json
{
  "query": "hello",
  "results": [
    {
      "conversation": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "General Chat",
        "isGroup": true,
        "participants": ["64f8a1b2c3d4e5f6a7b8c9d1", "64f8a1b2c3d4e5f6a7b8c9d2"]
      },
      "messages": [
        {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
          "content": "Hello everyone!",
          "sender": {
            "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
            "centralUsrId": "user123",
            "userName": "john_doe",
            "avatarUrl": "/uploads/avatar/user123.jpg"
          },
          "createdAt": "2024-01-15T10:30:00.000Z",
          "replyTo": null
        }
      ]
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid query parameter
- `403 Forbidden`: Access denied to specified conversation
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error during search

---

### 2. Search Users
Search for users by username, display name, or email.

**Endpoint:** `GET /api/search/users`

**Query Parameters:**
- `query` (required): Search term (minimum 1 character)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of results per page (default: 20)

**Example Request:**
```http
GET /api/search/users?query=john&page=1&limit=5
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**
```json
{
  "query": "john",
  "users": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "centralUsrId": "user123",
      "userName": "john_doe",
      "localUserName": "John Doe",
      "avatarUrl": "/uploads/avatar/user123.jpg",
      "bio": "Software Developer",
      "email": "john@example.com",
      "hasConversation": true,
      "conversationId": "64f8a1b2c3d4e5f6a7b8c9d4"
    },
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "centralUsrId": "user456",
      "userName": "johnny_smith",
      "localUserName": "Johnny Smith",
      "avatarUrl": "/uploads/avatar/user456.jpg",
      "bio": "Designer",
      "email": "johnny@example.com",
      "hasConversation": false,
      "conversationId": null
    }
  ],
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 5,
    "pages": 3
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid query parameter
- `404 Not Found`: Current user not found
- `500 Internal Server Error`: Server error during search

---

### 3. Search Conversations
Search for conversations by name or description.

**Endpoint:** `GET /api/search/conversations`

**Query Parameters:**
- `query` (required): Search term (minimum 1 character)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of results per page (default: 20)

**Example Request:**
```http
GET /api/search/conversations?query=project&page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**
```json
{
  "query": "project",
  "conversations": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "name": "Project Alpha Team",
      "isGroup": true,
      "participants": [
        {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "centralUsrId": "user123",
          "userName": "john_doe",
          "localUserName": "John Doe",
          "avatarUrl": "/uploads/avatar/user123.jpg"
        }
      ],
      "lastMessage": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
        "content": "Let's discuss the project timeline",
        "createdAt": "2024-01-15T14:20:00.000Z",
        "sender": "64f8a1b2c3d4e5f6a7b8c9d1"
      },
      "updatedAt": "2024-01-15T14:20:00.000Z",
      "avatar": "/uploads/groups/project_alpha.jpg"
    },
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
      "name": "Jane Smith",
      "isGroup": false,
      "participants": [
        {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d8",
          "centralUsrId": "user789",
          "userName": "jane_smith",
          "localUserName": "Jane Smith",
          "avatarUrl": "/uploads/avatar/user789.jpg"
        }
      ],
      "lastMessage": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d9",
        "content": "How's the project going?",
        "createdAt": "2024-01-15T12:15:00.000Z",
        "sender": "64f8a1b2c3d4e5f6a7b8c9d8"
      },
      "updatedAt": "2024-01-15T12:15:00.000Z",
      "avatar": null
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid query parameter
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error during search

---

### 4. Global Search
Perform a combined search across messages, users, and conversations.

**Endpoint:** `GET /api/search/global`

**Query Parameters:**
- `query` (required): Search term (minimum 1 character)
- `limit` (optional): Number of results per category (default: 5)

**Example Request:**
```http
GET /api/search/global?query=john&limit=3
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response:**
```json
{
  "query": "john",
  "results": {
    "messages": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "content": "Hey John, how are you?",
        "sender": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "centralUsrId": "user123",
          "userName": "jane_doe",
          "avatarUrl": "/uploads/avatar/user123.jpg"
        },
        "conversation": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
          "name": "General Chat",
          "isGroup": true
        },
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "users": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "centralUsrId": "user123",
        "userName": "john_doe",
        "localUserName": "John Doe",
        "avatarUrl": "/uploads/avatar/user123.jpg",
        "bio": "Software Developer",
        "email": "john@example.com"
      }
    ],
    "conversations": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
        "name": "John's Project Team",
        "isGroup": true,
        "participants": [
          {
            "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
            "centralUsrId": "user123",
            "userName": "john_doe",
            "localUserName": "John Doe",
            "avatarUrl": "/uploads/avatar/user123.jpg"
          }
        ],
        "lastMessage": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
          "content": "Project update meeting tomorrow",
          "createdAt": "2024-01-15T14:20:00.000Z"
        },
        "updatedAt": "2024-01-15T14:20:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid query parameter
- `500 Internal Server Error`: Server error during search

---

## Search Features

###  **Case-Insensitive Search**
All searches are case-insensitive and use regex pattern matching.

###  **Pagination Support**
Message, user, and conversation searches support pagination with customizable page size.

###  **Privacy & Security**
- Users can only search within their own conversations
- Search results respect conversation access permissions
- Current user is excluded from user search results

###  **Smart Matching**
- **Messages**: Search in message content
- **Users**: Search in username, display name, and email
- **Conversations**: Search in conversation name and group descriptions

###  **Performance Optimized**
- Efficient database queries with proper indexing
- Limited result sets to prevent performance issues
- Optimized population of related data

---

## Error Handling

### Common Error Codes:
- `400`: Bad Request - Invalid or missing parameters
- `401`: Unauthorized - Invalid or missing authentication token
- `403`: Forbidden - Access denied to resource
- `404`: Not Found - User or resource not found
- `500`: Internal Server Error - Server-side error

### Error Response Format:
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

---

## Usage Examples

### JavaScript/Fetch Example:
```javascript
// Global search
const searchGlobal = async (query) => {
  const response = await fetch(`/api/search/global?query=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

// Search users with pagination
const searchUsers = async (query, page = 1) => {
  const response = await fetch(`/api/search/users?query=${encodeURIComponent(query)}&page=${page}&limit=10`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};
```

### cURL Examples:
```bash
# Search messages
curl -X GET "/api/search/messages?query=hello&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Search users
curl -X GET "/api/search/users?query=john&page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Global search
curl -X GET "/api/search/global?query=project&limit=3" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Notes
- Minimum query length is 1 character
- Search is performed across user's accessible data only
- Results are sorted by relevance and recency
- Global search provides a quick overview across all categories
- For detailed results, use specific search endpoints with pagination
