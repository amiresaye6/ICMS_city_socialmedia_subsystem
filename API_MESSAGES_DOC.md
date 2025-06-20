# Messages API Documentation

**Base URL:** `http://graduation.amiralsayed.me/api/messages`

---

## Authentication

All endpoints require a Bearer token in the `Authorization` header:

```http
Authorization: Bearer <your_access_token>
```

---

## 1. Send a Message

**Endpoint:** `/send`
**Method:** `POST`
**Headers:**

* `Authorization: Bearer <token>`
* `Content-Type: multipart/form-data`

**Form Data:**

* `conversation`: Conversation ID (required)
* `content`: Text content (optional if files are provided)
* `files`: One or more file attachments (optional if content is provided)
* `replyTo`: Message ID being replied to (optional)

**Success Response:**

```json
{
  "message": "Message sent",
  "data": {
    "_id": "...",
    "conversation": "...",
    "sender": "...",
    "content": "Hello!",
    "messageType": "text",
    "attachments": [],
    "replyTo": null,
    "deliveredTo": [],
    "readBy": [],
    "deleted": false,
    "edited": false,
    "reactions": [],
    "createdAt": "...",
    "updatedAt": "...",
    "__v": 0
  }
}
```

**Error Responses:**

* `400 Bad Request`: Missing content or attachments
* `401 Unauthorized`: Invalid or missing token
* `404 Not Found`: Conversation not found
* `413 Payload Too Large`: File size exceeds limit
* `415 Unsupported Media Type`: Invalid file type

---

## 2. Get Messages Between Two Users

**Endpoint:** `/:user2`
**Method:** `GET`
**Headers:**

* `Authorization: Bearer <token>`

**Success Response:**

```json
[
  {
    "_id": "...",
    "sender": "user1",
    "recipient": "user2",
    "content": "Hello!",
    "createdAt": "...",
    "updatedAt": "...",
    "reactions": [],
    "replyTo": null,
    "attachments": [],
    "status": {
      "delivered": true,
      "read": false
    }
  }
]
```

**Error Responses:**

* `401 Unauthorized`
* `404 Not Found`: Conversation not found

---

## 3. Mark Messages as Delivered

**Endpoint:** `/delivered/:userId`
**Method:** `PUT`
**Headers:**

* `Authorization: Bearer <token>`

**Success Response:**

```json
{
  "message": "Messages marked as delivered"
}
```

---

## 4. Mark Messages as Read

**Endpoint:** `/read/:userId`
**Method:** `PUT`
**Headers:**

* `Authorization: Bearer <token>`

**Success Response:**

```json
{
  "message": "Messages marked as read"
}
```

---

## 5. Edit a Message

**Endpoint:** `/:messageId/edit`
**Method:** `PUT`
**Headers:**

* `Authorization: Bearer <token>`
* `Content-Type: application/json`

**Body:**

```json
{
  "text": "Updated content"
}
```

**Success Response:**

```json
{
  "message": "Message edited successfully",
  "data": {
    "_id": "...",
    "content": "Updated content",
    "edited": true
  }
}
```

**Error Responses:**

* `403 Forbidden`: Not authorized to edit
* `404 Not Found`: Message not found
* `400 Bad Request`: Invalid content

---

## 6. Delete a Message (Soft Delete)

**Endpoint:** `/:messageId`
**Method:** `DELETE`
**Headers:**

* `Authorization: Bearer <token>`

**Success Response:**

```json
{
  "message": "Message deleted successfully",
  "data": {
    "_id": "...",
    "deleted": true,
    "content": "This message was deleted."
  }
}
```

---

## 7. Unsend a Message (Permanent Delete)

**Endpoint:** `/unsend/:messageId`
**Method:** `DELETE`
**Headers:**

* `Authorization: Bearer <token>`

**Success Response:**

```json
{
  "message": "Message unsent successfully"
}
```

---

## 8. Add Reaction to Message

**Endpoint:** `/:messageId/reaction`
**Method:** `POST`
**Headers:**

* `Authorization: Bearer <token>`
* `Content-Type: application/json`

**Body:**

```json
{
  "userId": "user123",
  "emoji": "like"
}
```

**Allowed Emojis:**

* like, love, haha, sad, angry, wow, care

**Success Response:**

```json
{
  "message": "Reaction added successfully",
  "data": { ... }
}
```

---

## 9. Remove Reaction from Message

**Endpoint:** `/:messageId/reaction`
**Method:** `DELETE`
**Headers:**

* `Authorization: Bearer <token>`

**Success Response:**

```json
{
  "message": "Reaction removed successfully",
  "data": { ... }
}
```

---

## 9. Get Pinned Messages

**Endpoint:** `/pinned`
**Method:** `GET`
**Headers:**

* `Authorization: Bearer <token>`

**Success Response:**

```json
{
  "messages": [
    {
      "_id": "...",
      "conversation": "...",
      "sender": "...",
      "content": "Important message",
      "messageType": "text",
      "isPinned": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

**Error Responses:**

* `401 Unauthorized`: Invalid or missing token
* `500 Internal Server Error`: Server error

---

## Rate Limiting

All endpoints are limited to 100 requests per minute.

---

## Error Handling

All error responses follow this structure:

```json
{
  "error": "Descriptive error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional details
  }
}



