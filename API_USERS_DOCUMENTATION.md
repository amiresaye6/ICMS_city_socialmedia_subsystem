# Users API Documentation

Base URL: `http://graduation.amiralsayed.me/api/users`

---

## 1. Get All Users

- **Endpoint:** `/`
- **Method:** `GET`
- **Headers:**
    - `Authorization: Bearer <token>`

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/users', {
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
        "centralUsrId": "user123",
        "userName": "john_doe",
        "localUserName": "John Doe",
        "email": "john@example.com",
        "avatarUrl": "/public/uploads/default.png",
        "bio": "hi there!",
        "role": "user",
        "friends": [],
        "posts": [],
        "savedPosts": [],
        "sharedPosts": [],
        "createdAt": "2025-02-24T10:00:00Z",
        "updatedAt": "2025-02-24T10:00:00Z"
    }
]
```

**Error Response:**
```json
{
    "message": "Internal server error"
}
```

---

## 2. Get My User Profile

- **Endpoint:** `/me`
- **Method:** `GET`
- **Headers:**
    - `Authorization: Bearer <token>`

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/users/me', {
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
    "_id": "507f1f77bcf86cd799439011",
    "centralUsrId": "user123",
    "userName": "john_doe",
    "localUserName": "John Doe",
    "email": "john@example.com",
    "avatarUrl": "/public/uploads/default.png",
    "bio": "hi there!",
    "role": "user",
    "friends": [],
    "posts": [],
    "savedPosts": [],
    "sharedPosts": [],
    "createdAt": "2025-02-24T10:00:00Z",
    "updatedAt": "2025-02-24T10:00:00Z"
}
```

**Error Response:**
```json
{
    "message": "User not found"
}
```

---

## 3. Get User by ID

- **Endpoint:** `/:userId`
- **Method:** `GET`
- **Headers:**
    - `Authorization: Bearer <token>`
- **URL Parameters:**
    - `userId` (required) - Central User ID (string)

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/users/user123', {
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
    "_id": "507f1f77bcf86cd799439011",
    "centralUsrId": "user123",
    "userName": "john_doe",
    "localUserName": "John Doe",
    "email": "john@example.com",
    "avatarUrl": "/public/uploads/default.png",
    "bio": "hi there!",
    "role": "user",
    "friends": [],
    "posts": [],
    "savedPosts": [],
    "sharedPosts": [],
    "createdAt": "2025-02-24T10:00:00Z",
    "updatedAt": "2025-02-24T10:00:00Z"
}
```

**Error Response:**
```json
{
    "message": "User not found"
}
```

---

## 4. Change Username

- **Endpoint:** `/me`
- **Method:** `PUT`
- **Headers:**
    - `Authorization: Bearer <token>`
    - `Content-Type: application/json`
- **Body Parameters:**
    - `userName` (required) - String

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/users/me', {
    method: 'PUT',
    headers: {
        'Authorization': 'Bearer your_jwt_token',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        userName: 'new_john_doe'
    })
})
.then(response => response.json())
.then(data => console.log(data));
```

**Success Response:**
```json
{
    "_id": "507f1f77bcf86cd799439011",
    "centralUsrId": "user123",
    "userName": "new_john_doe",
    "localUserName": "new_john_doe",
    "email": "john@example.com",
    "avatarUrl": "/public/uploads/default.png",
    "bio": "hi there!",
    "role": "user",
    "friends": [],
    "posts": [],
    "savedPosts": [],
    "sharedPosts": [],
    "createdAt": "2025-02-24T10:00:00Z",
    "updatedAt": "2025-02-24T10:05:00Z"
}
```

**Error Response:**
```json
{
    "message": "Forbidden: You are not allowed to perform this action"
}
```

---

## 5. Change Avatar

- **Endpoint:** `/me/avatar`
- **Method:** `PUT`
- **Headers:**
    - `Authorization: Bearer <token>`
    - `Content-Type: multipart/form-data`
- **Body Parameters:**
    - `avatar` (required) - File (image, video, or audio)

**Example:**
```javascript
const formData = new FormData();
formData.append('avatar', fileInput.files[0]);

fetch('http://graduation.amiralsayed.me/api/users/me/avatar', {
    method: 'PUT',
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
    "_id": "507f1f77bcf86cd799439011",
    "centralUsrId": "user123",
    "userName": "john_doe",
    "localUserName": "John Doe",
    "email": "john@example.com",
    "avatarUrl": "/public/uploads/1733839688988-avatar.jpg",
    "bio": "hi there!",
    "role": "user",
    "friends": [],
    "posts": [],
    "savedPosts": [],
    "sharedPosts": [],
    "createdAt": "2025-02-24T10:00:00Z",
    "updatedAt": "2025-02-24T10:05:00Z"
}
```

**Error Response:**
```json
{
    "message": "At least one media file is required"
}
```

---

## 6. Change Cover

- **Endpoint:** `/me/cover`
- **Method:** `PUT`
- **Headers:**
    - `Authorization: Bearer <token>`
    - `Content-Type: multipart/form-data`
- **Body Parameters:**
    - `cover` (required) - File (image, video, or audio)

**Example:**
```javascript
const formData = new FormData();
formData.append('cover', fileInput.files[0]);

fetch('http://graduation.amiralsayed.me/api/users/me/cover', {
    method: 'PUT',
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
    "_id": "507f1f77bcf86cd799439011",
    "centralUsrId": "user123",
    "userName": "john_doe",
    "localUserName": "John Doe",
    "email": "john@example.com",
    "avatarUrl": "/public/uploads/default.png",
    "coverUrl": "/public/uploads/1733839688988-cover.jpg",
    "bio": "hi there!",
    "role": "user",
    "friends": [],
    "posts": [],
    "savedPosts": [],
    "sharedPosts": [],
    "createdAt": "2025-02-24T10:00:00Z",
    "updatedAt": "2025-02-24T10:05:00Z"
}
```

**Error Response:**
```json
{
    "message": "At least one media file is required"
}
```

---

### Notes:
1. **Authentication**: All endpoints require a valid JWT token obtained from the central authentication system (`/api/auth/login`).
2. **Error Handling**: Common error responses include `401 Unauthorized` (invalid/missing token), `403 Forbidden` (insufficient permissions), `404 Not Found` (resource not found), and `500 Internal Server Error` (server issues).

## 7. Change Bio

- **Endpoint:** `/me/bio`
- **Method:** `PUT`
- **Headers:**
    - `Authorization: Bearer <token>`
    - `Content-Type: application/json`
- **Body Parameters:**
    - `newBio` (required) - String

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/users/me/bio', {
    method: 'PUT',
    headers: {
        'Authorization': 'Bearer your_jwt_token',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        newBio: 'New bio description'
    })
})
.then(response => response.json())
.then(data => console.log(data));
```

**Success Response:**
```json
{
    "_id": "507f1f77bcf86cd799439011",
    "centralUsrId": "user123",
    "userName": "john_doe",
    "localUserName": "John Doe",
    "email": "john@example.com",
    "avatarUrl": "/public/uploads/default.png",
    "bio": "New bio description",
    "role": "user",
    "friends": [],
    "posts": [],
    "savedPosts": [],
    "sharedPosts": [],
    "createdAt": "2025-02-24T10:00:00Z",
    "updatedAt": "2025-02-24T10:05:00Z"
}
```

**Error Response:**
```json
{
    "message": "Invalid request, user ID and user newBio are required"
}
```
```json
{
    "message": "User not found"
}
```
```json
{
    "message": "Forbidden: You are not allowed to perform this action"
}
```
