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

**Endpoint:** `/:user1/:user2`
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
  "content": "Updated content"
}
```

**Success Response:**

```json
{
  "message": "Message edited successfully",
  "data": {
    "_id": "...",
    "content": "Updated content",
    "edited": true,
    "editHistory": [
      {
        "content": "Original content",
        "editedAt": "..."
      }
    ]
  }
}
```

**Error Responses:**

* `400 Bad Request`: Empty content
* `403 Forbidden`: Not authorized to edit (not the sender)
* `404 Not Found`: Message not found

---

## 6. Delete a Message (Soft Delete)

**Endpoint:** `/:messageId/delete`
**Method:** `PUT`
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

**Error Responses:**

* `403 Forbidden`: Not authorized to delete (not the sender)
* `404 Not Found`: Message not found

---

## 7. Unsend a Message (Permanent Delete)

**Endpoint:** `/:messageId/unsends`
**Method:** `DELETE`
**Headers:**

* `Authorization: Bearer <token>`

**Success Response:**

```json
{
  "message": "Message unsent successfully"
}
```

**Error Responses:**

* `403 Forbidden`: Not authorized to unsend (not the sender)
* `404 Not Found`: Message not found

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
  "emoji": "like"
}
```

**Allowed Emojis:**

* like, love, haha, sad, angry, wow, care

**Success Response:**

```json
{
  "message": "Reaction added successfully",
  "data": {
    "_id": "...",
    "reactions": [
      {
        "user": "user123",
        "emoji": "like",
        "createdAt": "..."
      }
    ]
  }
}
```

**Error Responses:**

* `400 Bad Request`: Invalid emoji
* `404 Not Found`: Message not found

---

## 9. Remove Reaction from Message

**Endpoint:** `/:messageId/reaction/remove`
**Method:** `PUT`
**Headers:**

* `Authorization: Bearer <token>`
* `Content-Type: application/json`

**Body:**

```json
{
  "emoji": "like"
}
```

**Success Response:**

```json
{
  "message": "Reaction removed successfully",
  "data": {
    "_id": "...",
    "reactions": []
  }
}
```

**Error Responses:**

* `404 Not Found`: Message or reaction not found

---

## 10. Pin/Unpin a Message

**Endpoint:** `/:messageId/pin`
**Method:** `PUT`
**Headers:**

* `Authorization: Bearer <token>`

**Success Response:**

```json
{
  "message": "Message pinned successfully",
  "data": {
    "_id": "...",
    "isPinned": true
  }
}
```

or

```json
{
  "message": "Message unpinned successfully",
  "data": {
    "_id": "...",
    "isPinned": false
  }
}
```

**Error Responses:**

* `403 Forbidden`: Not authorized to pin/unpin (not the sender)
* `404 Not Found`: Message not found

---

## 11. Get Pinned Messages

**Endpoint:** `/pinned/:conversationId`
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
      "pinnedBy": "user123",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

**Error Responses:**

* `401 Unauthorized`: Invalid or missing token
* `404 Not Found`: Conversation not found

---

## 12. Forward a Message

**Endpoint:** `/forward`
**Method:** `POST`
**Headers:**

* `Authorization: Bearer <token>`
* `Content-Type: application/json`

**Body:**

```json
{
  "messageId": "original-message-id",
  "conversations": ["target-conversation-id-1", "target-conversation-id-2"]
}
```

**Success Response:**

```json
{
  "message": "Message forwarded successfully",
  "data": {
    "originalMessageId": "original-message-id",
    "forwardedMessages": [
      {
        "conversation": "target-conversation-id-1",
        "_id": "new-message-id-1"
      },
      {
        "conversation": "target-conversation-id-2",
        "_id": "new-message-id-2"
      }
    ]
  }
}
```

**Error Responses:**

* `400 Bad Request`: Missing required fields
* `404 Not Found`: Original message or conversation not found

---

## 13. Search Messages

**Endpoint:** `/search`
**Method:** `GET`
**Headers:**

* `Authorization: Bearer <token>`

**Query Parameters:**

* `query`: Search term (required)
* `conversation`: Conversation ID (optional, to limit search to a specific conversation)
* `limit`: Maximum number of results (optional, default: 20)
* `page`: Page number for pagination (optional, default: 1)

**Success Response:**

```json
{
  "totalResults": 5,
  "page": 1,
  "totalPages": 1,
  "messages": [
    {
      "_id": "...",
      "conversation": "...",
      "sender": "...",
      "content": "Message containing search term",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

**Error Responses:**

* `400 Bad Request`: Missing search query
* `401 Unauthorized`: Invalid or missing token

---

## Rate Limiting

All endpoints are limited to 100 requests per minute.

---

## Error Handling

All error responses follow this structure:

```json
{
  "error": "Descriptive error message",
  "details": "Additional error details (optional)"
}
```

---

## API Endpoints Summary

| Endpoint | Method | Description |
| `/send` | POST | Send a new message |
| `/:user1/:user2` | GET | Get messages between two users |
| `/delivered/:userId` | PUT | Mark messages as delivered |
| `/read/:userId` | PUT | Mark messages as read |
| `/:messageId/edit` | PUT | Edit a message |
| `/:messageId/delete` | PUT | Soft delete a message |
| `/:messageId/unsends` | DELETE | Permanently delete a message |
| `/:messageId/reaction` | POST | Add reaction to a message |
| `/:messageId/reaction/remove` | PUT | Remove reaction from a message |
| `/:messageId/pin` | PUT | Pin/unpin a message |
| `/pinned/:conversationId` | GET | Get pinned messages in a conversation |
| `/forward` | POST | Forward a message to other conversations |
| `/search` | GET | Search messages |



