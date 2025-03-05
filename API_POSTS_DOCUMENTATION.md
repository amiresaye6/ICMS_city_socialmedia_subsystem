# Posts API Documentation

Base URL: `http://graduation.amiralsayed.me/api/posts`

## 1. Get All Posts (Paginated)

- **Endpoint:** `/`
- **Method:** `GET`
- **Headers:**
    - `Authorization: Bearer <token>`
- **Query Parameters:**
    - `page` (optional) - Page number (default: 1)
    - `limit` (optional) - Items per page (default: 10)

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/posts?page=2&limit=5', {
    headers: {
        'Authorization': 'Bearer your_jwt_token'
    }
})
.then(response => response.json())
.then(data => console.log(data));
```

**Success Response:**
```json
{
    "message": "Posts retrieved successfully",
    "pagination": {
        "totalPosts": 100,
        "totalPages": 20,
        "currentPage": 2,
        "hasNextPage": true,
        "hasPrevPage": true
    },
    "data": [
        // Array of post objects
    ]
}
```

## 2. Create New Post

- **Endpoint:** `/`
- **Method:** `POST`
- **Headers:**
    - `Authorization: Bearer <token>`
    - `Content-Type: multipart/form-data`
- **Body Parameters:**
    - `postCaption` (required) - String (3-1000 chars)
    - `media` (required) - 1-5 files (images/videos/audio)

**Example:**
```javascript
const formData = new FormData();
formData.append('postCaption', 'New city park opening!');
formData.append('media', fileInput.files[0]);

fetch('http://graduation.amiralsayed.me/api/posts', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer your_jwt_token'
    },
    body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

**Success Response:**
```json
{
    "postCaption": "New city park opening!",
    "media": [
        {
            "type": "image",
            "url": "/public/uploads/1733839688988-548819799.jpg"
        }
    ],
    "author": "user123",
    "_id": "507f1f77bcf86cd799439011",
    "createdAt": "2025-02-24T10:00:00Z",
    "updatedAt": "2025-02-24T10:00:00Z"
}
```

## 3. Add Reaction to Post

- **Endpoint:** `/:postId/reactions`
- **Method:** `POST`
- **Headers:**
    - `Authorization: Bearer <token>`
    - `Content-Type: application/json`
- **URL Parameters:**
    - `postId` (required) - Valid MongoDB ID
- **Body:**
```json
{
    "reactionType": "like"
}
```
    Valid reaction types: `like`, `love`, `care`, `laugh`, `sad`, `hate`

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/posts/507f1f77bcf86cd799439011/reactions', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer your_jwt_token',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        reactionType: 'love'
    })
})
.then(response => response.json())
.then(data => console.log(data));
```

**Success Response:**
```json
{
    "message": "Reaction processed successfully",
    "post": {
        "impressionsCount": {
            "like": 0,
            "love": 1,
            "care": 0,
            "laugh": 0,
            "sad": 0,
            "hate": 0,
            "total": 1
        },
        "impressionList": [
            {
                "userId": "user123",
                "impressionType": "love"
            }
        ]
    }
}
```

## 4. Share Post

- **Endpoint:** `/:postId/shares`
- **Method:** `POST`
- **Headers:**
    - `Authorization: Bearer <token>`
- **URL Parameters:**
    - `postId` (required) - Valid MongoDB ID

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/posts/507f1f77bcf86cd799439011/shares', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer your_jwt_token'
    }
})
.then(response => response.json())
.then(data => console.log(data));
```

**Success Response:**
```json
{
    "message": "User added to the share list successfully",
    "post": {
        "shareCount": 5,
        "shareList": ["userId1", "userId2", "user123"]
    }
}
```

## 5. Update Post Status

- **Endpoint:** `/:postId/status`
- **Method:** `PUT`
- **Headers:**
    - `Authorization: Bearer <token>`
    - `Content-Type: application/json`
- **URL Parameters:**
    - `postId` (required) - Valid MongoDB ID
- **Body:**
```json
{
    "newStatus": "archived"
}
```
    Valid statuses: `active`, `archived`, `deleted`

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/posts/507f1f77bcf86cd799439011/status', {
    method: 'PUT',
    headers: {
        'Authorization': 'Bearer your_jwt_token',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        newStatus: 'archived'
    })
})
.then(response => response.json())
.then(data => console.log(data));
```

**Success Response:**
```json
{
    "message": "Post status updated successfully",
    "post": {
        "status": "archived"
    }
}
```

## 6. Delete Post

- **Endpoint:** `/:postId`
- **Method:** `DELETE`
- **Headers:**
    - `Authorization: Bearer <token>`
- **URL Parameters:**
    - `postId` (required) - Valid MongoDB ID

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/posts/507f1f77bcf86cd799439011', {
    method: 'DELETE',
    headers: {
        'Authorization': 'Bearer your_jwt_token'
    }
})
.then(response => response.json())
.then(data => console.log(data));
```

**Success Response:**
```json
{
    "message": "Post deleted successfully"
}
```

## 7. Get Posts by User

- **Endpoint:** `/user/:userId`
- **Method:** `GET`
- **Headers:**
    - `Authorization: Bearer <token>`
- **URL Parameters:**
    - `userId` (required) - Central User ID (string)

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/posts/user/user123', {
    headers: {
        'Authorization': 'Bearer your_jwt_token'
    }
})
.then(response => response.json())
.then(data => console.log(data));
```

**Success Response:**
```json
{
    "message": "Posts retrieved successfully",
    "data": [
        // Array of post objects
    ]
}
```

## 8. Update Post Caption

- **Endpoint:** `/:postId/caption`
- **Method:** `PUT`
- **Headers:**
    - `Authorization: Bearer <token>`
    - `Content-Type: application/json`
- **URL Parameters:**
    - `postId` (required) - Valid MongoDB ID
- **Body:**
```json
{
    "newCaption": "Updated caption for the post"
}
```

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/posts/507f1f77bcf86cd799439011/caption', {
    method: 'PUT',
    headers: {
        'Authorization': 'Bearer your_jwt_token',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        newCaption: 'Updated caption for the post'
    })
})
.then(response => response.json())
.then(data => console.log(data));
```

**Success Response:**
```json
{
    "message": "Caption updated successfully",
    "post": {
        "postCaption": "Updated caption for the post"
    }
}
```

## 9. Add Tag to Post

- **Endpoint:** `/:postId/tags`
- **Method:** `POST`
- **Headers:**
    - `Authorization: Bearer <token>`
    - `Content-Type: application/json`
- **URL Parameters:**
    - `postId` (required) - Valid MongoDB ID
- **Body:**
```json
{
    "newTag": "CityImprovement"
}
```

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/posts/507f1f77bcf86cd799439011/tags', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer your_jwt_token',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        newTag: 'CityImprovement'
    })
})
.then(response => response.json())
.then(data => console.log(data));
```

**Success Response:**
```json
{
    "message": "Tag added successfully",
    "post": {
        "tags": ["CityImprovement"]
    }
}
```

## 10. Update Tag on Post

- **Endpoint:** `/:postId/tags`
- **Method:** `PUT`
- **Headers:**
    - `Authorization: Bearer <token>`
    - `Content-Type: application/json`
- **URL Parameters:**
    - `postId` (required) - Valid MongoDB ID
- **Body:**
```json
{
    "oldTag": "CityImprovement",
    "newTag": "UrbanDevelopment"
}
```

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/posts/507f1f77bcf86cd799439011/tags', {
    method: 'PUT',
    headers: {
        'Authorization': 'Bearer your_jwt_token',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        oldTag: 'CityImprovement',
        newTag: 'UrbanDevelopment'
    })
})
.then(response => response.json())
.then(data => console.log(data));
```

**Success Response:**
```json
{
    "message": "Tag updated successfully",
    "post": {
        "tags": ["UrbanDevelopment"]
    }
}
```

## 11. Delete Tag from Post

- **Endpoint:** `/:postId/tags`
- **Method:** `DELETE`
- **Headers:**
    - `Authorization: Bearer <token>`
    - `Content-Type: application/json`
- **URL Parameters:**
    - `postId` (required) - Valid MongoDB ID
- **Body:**
```json
{
    "tagToDelete": "UrbanDevelopment"
}
```

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/posts/507f1f77bcf86cd799439011/tags', {
    method: 'DELETE',
    headers: {
        'Authorization': 'Bearer your_jwt_token',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        tagToDelete: 'UrbanDevelopment'
    })
})
.then(response => response.json())
.then(data => console.log(data));
```

**Success Response:**
```json
{
    "message": "Tag deleted successfully",
    "post": {
        "tags": []
    }
}
```

## 12. Save Post

- **Endpoint:** `/:postId/saves`
- **Method:** `POST`
- **Headers:**
    - `Authorization: Bearer <token>`
- **URL Parameters:**
    - `postId` (required) - Valid MongoDB ID

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/posts/507f1f77bcf86cd799439011/saves', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer your_jwt_token'
    }
})
.then(response => response.json())
.then(data => console.log(data));
```

**Success Response:**
```json
{
    "message": "User added to the save list successfully",
    "post": {
        "saveCount": 3,
        "saveList": ["userId1", "userId2", "user123"]
    }
}
```

## 13. Update Post Availability

- **Endpoint:** `/:postId/availability`
- **Method:** `PUT`
- **Headers:**
    - `Authorization: Bearer <token>`
    - `Content-Type: application/json`
- **URL Parameters:**
    - `postId` (required) - Valid MongoDB ID
- **Body:**
```json
{
    "newAvailability": "friends"
}
```
    Valid availability options: `public`, `private`, `friends`, `specific_groups`

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/posts/507f1f77bcf86cd799439011/availability', {
    method: 'PUT',
    headers: {
        'Authorization': 'Bearer your_jwt_token',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        newAvailability: 'friends'
    })
})
.then(response => response.json())
.then(data => console.log(data));
```

**Success Response:**
```json
{
    "message": "Availability updated successfully",
    "post": {
        "availability": "friends"
    }
}
```

## 14. Get Post by ID

- **Endpoint:** `/:postId`
- **Method:** `GET`
- **Headers:**
    - `Authorization: Bearer <token>`
- **URL Parameters:**
    - `postId` (required) - Valid MongoDB ID

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/posts/507f1f77bcf86cd799439011', {
    headers: {
        'Authorization': 'Bearer your_jwt_token'
    }
})
.then(response => response.json())
.then(data => console.log(data));
```

**Success Response:**
```json
{
    "message": "Post retrieved successfully",
    "data": {
        "postCaption": "New city park opening!",
        "media": [
            {
                "type": "image",
                "url": "/public/uploads/1733839688988-548819799.jpg"
            }
        ],
        "author": "user123",
        "_id": "507f1f77bcf86cd799439011",
        "createdAt": "2025-02-24T10:00:00Z",
        "updatedAt": "2025-02-24T10:00:00Z"
    }
}
```

## 15. Delete Share

- **Endpoint:** `/:postId/unshare`
- **Method:** `POST`
- **Headers:**
    - `Authorization: Bearer <token>`
- **URL Parameters:**
    - `postId` (required) - Valid MongoDB ID

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/posts/507f1f77bcf86cd799439011/unshare', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer your_jwt_token'
    }
})
.then(response => response.json())
.then(data => console.log(data));
```

**Success Response:**
```json
{
    "message": "User removed from the share list successfully",
    "post": {
        "shareCount": 4,
        "shareList": ["userId1", "userId2"]
    }
}
```

## Summary of All Endpoints

| Endpoint              | Method | Description                  |
|-----------------------|--------|------------------------------|
| /                     | GET    | Get all posts (paginated)    |
| /                     | POST   | Create a new post            |
| /:postId/reactions    | POST   | Add reaction to post         |
| /:postId/shares       | POST   | Share a post                 |
| /:postId/status       | PUT    | Update post status           |
| /:postId              | DELETE | Delete a post                |
| /user/:userId         | GET    | Get posts by user            |
| /:postId/caption      | PUT    | Update post caption          |
| /:postId/tags         | POST   | Add tag to post              |
| /:postId/tags         | PUT    | Update tag on post           |
| /:postId/tags         | DELETE | Delete tag from post         |
| /:postId/saves        | POST   | Save a post                  |
| /:postId/availability | PUT    | Update post availability     |
| /:postId              | GET    | Get post by ID               |
| /:postId/unshare      | POST   | Delete a share               |
