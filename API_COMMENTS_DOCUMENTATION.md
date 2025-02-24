# Comments API Documentation

Base URL: `http://graduation.amiralsayed.me/api/comments`

---

## 1. Get All Comments

- **Endpoint:** `/`
- **Method:** `GET`
- **Headers:**
    - `Authorization: Bearer <token>`

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/comments', {
    headers: {
        'Authorization': 'Bearer your_jwt_token'
    }
})
.then(response => response.json())
.then(data => console.log(data));
```

**Success Response:**
```json
[
    {
        "_id": "507f1f77bcf86cd799439011",
        "postId": "507f1f77bcf86cd799439012",
        "userId": "507f1f77bcf86cd799439013",
        "content": "Great post!",
        "parentCommentId": null,
        "replies": [],
        "reactions": [],
        "createdAt": "2025-02-24T10:00:00Z",
        "updatedAt": "2025-02-24T10:00:00Z"
    }
]
```

**Error Response:**
```json
{
    "message": "No comments found"
}
```

---

## 2. Get Comments by Post ID

- **Endpoint:** `/post/:postId`
- **Method:** `GET`
- **Headers:**
    - `Authorization: Bearer <token>`
- **URL Parameters:**
    - `postId` (required) - Valid MongoDB ID

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/comments/post/507f1f77bcf86cd799439012', {
    headers: {
        'Authorization': 'Bearer your_jwt_token'
    }
})
.then(response => response.json())
.then(data => console.log(data));
```

**Success Response:**
```json
[
    {
        "_id": "507f1f77bcf86cd799439011",
        "postId": "507f1f77bcf86cd799439012",
        "userId": "507f1f77bcf86cd799439013",
        "content": "Nice one!",
        "parentCommentId": null,
        "replies": [],
        "reactions": [],
        "createdAt": "2025-02-24T10:00:00Z"
    }
]
```

**Error Response:**
```json
{
    "message": "No comments found"
}
```

---

## 3. Create a New Comment or Reply

- **Endpoint:** `/post/:postId`
- **Method:** `POST`
- **Headers:**
    - `Authorization: Bearer <token>`
    - `Content-Type: application/json`
- **URL Parameters:**
    - `postId` (required) - Valid MongoDB ID
- **Body Parameters:**
    - `content` (required) - String
    - `parentCommentId` (optional) - Valid MongoDB ID (for replies)

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/comments/post/507f1f77bcf86cd799439012', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer your_jwt_token',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        content: 'This is a comment!',
        parentCommentId: null
    })
})
.then(response => response.json())
.then(data => console.log(data));
```

**Success Response:**
```json
{
    "message": "Comment created successfully",
    "comment": {
        "_id": "507f1f77bcf86cd799439011",
        "postId": "507f1f77bcf86cd799439012",
        "userId": "507f1f77bcf86cd799439013",
        "content": "This is a comment!",
        "parentCommentId": null,
        "replies": [],
        "reactions": [],
        "createdAt": "2025-02-24T10:00:00Z"
    }
}
```

**Error Response:**
```json
{
    "message": "Invalid Post ID"
}
```

---

## 4. Update a Comment

- **Endpoint:** `/:commentId`
- **Method:** `PUT`
- **Headers:**
    - `Authorization: Bearer <token>`
    - `Content-Type: application/json`
- **URL Parameters:**
    - `commentId` (required) - Valid MongoDB ID
- **Body Parameters:**
    - `content` (required) - String

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/comments/507f1f77bcf86cd799439011', {
    method: 'PUT',
    headers: {
        'Authorization': 'Bearer your_jwt_token',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        content: 'Updated comment text'
    })
})
.then(response => response.json())
.then(data => console.log(data));
```

**Success Response:**
```json
{
    "message": "Comment updated successfully",
    "comment": {
        "_id": "507f1f77bcf86cd799439011",
        "content": "Updated comment text",
        "updatedAt": "2025-02-24T10:05:00Z"
    }
}
```

**Error Response:**
```json
{
    "message": "Content cannot be empty"
}
```

---

## 5. Delete a Comment

- **Endpoint:** `/:commentId`
- **Method:** `DELETE`
- **Headers:**
    - `Authorization: Bearer <token>`
- **URL Parameters:**
    - `commentId` (required) - Valid MongoDB ID

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/comments/507f1f77bcf86cd799439011', {
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
    "message": "Comment deleted successfully",
    "comment": {
        "_id": "507f1f77bcf86cd799439011",
        "content": "Updated comment text"
    }
}
```

**Error Response:**
```json
{
    "message": "Invalid Comment ID"
}
```

---

## 6. React to a Comment

- **Endpoint:** `/:commentId/reactions`
- **Method:** `POST`
- **Headers:**
    - `Authorization: Bearer <token>`
    - `Content-Type: application/json`
- **URL Parameters:**
    - `commentId` (required) - Valid MongoDB ID
- **Body:**
    ```json
    {
        "impressionType": "like"
    }
    ```
    Valid reaction types: `like`, `love`, `care`, `laugh`, `sad`, `hate`

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/comments/507f1f77bcf86cd799439011/reactions', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer your_jwt_token',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        impressionType: 'love'
    })
})
.then(response => response.json())
.then(data => console.log(data));
```

**Success Response:**
```json
{
    "message": "Reaction updated successfully",
    "comment": {
        "_id": "507f1f77bcf86cd799439011",
        "reactions": [
            {
                "userId": "507f1f77bcf86cd799439013",
                "impressionType": "love"
            }
        ]
    },
    "reactionCount": 1
}
```

**Error Response:**
```json
{
    "message": "Invalid reaction type"
}
```
