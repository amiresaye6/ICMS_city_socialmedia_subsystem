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
        "rule": "user",
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
    "message": "No users found"
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
    "rule": "user",
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
    - `userId` (required) - Valid MongoDB ID

**Example:**
```javascript
fetch('http://graduation.amiralsayed.me/api/users/507f1f77bcf86cd799439011', {
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
    "rule": "user",
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
    "message": "Username updated successfully",
    "user": {
        "_id": "507f1f77bcf86cd799439011",
        "userName": "new_john_doe",
        "localUserName": "John Doe",
        "email": "john@example.com",
        "updatedAt": "2025-02-24T10:05:00Z"
    }
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
    - `avatar` (required) - File (image)

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
    "message": "Avatar updated successfully",
    "user": {
        "_id": "507f1f77bcf86cd799439011",
        "userName": "john_doe",
        "avatarUrl": "/public/uploads/1733839688988-avatar.jpg",
        "updatedAt": "2025-02-24T10:05:00Z"
    }
}
```

**Error Response:**
```json
{
    "message": "No file uploaded"
}
```
