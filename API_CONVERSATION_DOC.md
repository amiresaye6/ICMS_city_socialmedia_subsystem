# Conversations API Documentation

**Base URL:** `http://graduation.amiralsayed.me/api/conversations`

---

## Authentication

All endpoints require a valid JWT Bearer token via the `Authorization` header:

```http
Authorization: Bearer <token>
```

---

## 1. Get All Conversations for User

**Endpoint:** `GET /:userId`

**Description:** Returns all conversations the authenticated user is part of, including the last message and unread count.

**Success Response:**

```json
[
  {
    "_id": "conv123",
    "participants": ["user1", "user2"],
    "lastMessage": {
      "content": "Hey there!",
      "sender": "user1",
      "createdAt": "2025-06-20T10:00:00Z"
    },
    "unreadMessages": 2,
    "updatedAt": "2025-06-20T10:00:00Z"
  }
]
```

---

## 2. Create a New Conversation

**Endpoint:** `POST /`

**Body:**

```json
{
  "participants": ["user1", "user2"]
}
```

**Success Response:**

```json
{
  "message": "Conversation created",
  "conversation": {
    "_id": "conv123",
    "participants": ["user1", "user2"]
  }
}
```

---

## 3. Delete a Conversation

**Endpoint:** `DELETE /:conversationId`

**Success Response:**

```json
{
  "message": "Conversation deleted successfully"
}
```

---

## 4. Rename a Conversation

**Endpoint:** `PUT /:conversationId/rename`

**Body:**

```json
{
  "newName": "Project Discussion"
}
```

**Success Response:**

```json
{
  "message": "Conversation renamed successfully",
  "conversation": {
    "_id": "conv123",
    "name": "Project Discussion"
  }
}
```

---

## 5. Update Participants (Add/Remove)

**Endpoint:** `PUT /:conversationId/participants`

**Body:**

```json
{
  "userId": "user3",
  "action": "add"
}
```

**Success Response:**

```json
{
  "message": "User added successfully",
  "conversation": {
    "_id": "conv123",
    "participants": ["user1", "user2", "user3"]
  }
}
```

---

## 6. Get Unread Conversations

**Endpoint:** `GET /:conversationId/unread`

**Success Response:**

```json
[
  {
    "conversation": {
      "_id": "conv123",
      "participants": ["user1", "user2"]
    },
    "lastMessage": {
      "text": "New message",
      "senderId": "user2",
      "recipientId": "user1",
      "createdAt": "2025-06-20T12:00:00Z"
    }
  }
]
```

---

## 7. Pin/Unpin a Conversation

**Endpoint:** `PUT /:conversationId/pin/:userId`

**Success Response:**

```json
{
  "message": "Conversation pin status updated"
}
```

---

## 8. Archive/Unarchive a Conversation

**Endpoint:** `PUT /:conversationId/archive/:userId`

**Success Response:**

```json
{
  "message": "Conversation archive status updated"
}
```

---

## 9. Mute/Unmute a Conversation

**Endpoint:** `PUT /:conversationId/mute/:userId`

**Success Response:**

```json
{
  "message": "Conversation mute status updated"
}
```

---

## 10. Get Pinned Conversations

**Endpoint:** `GET /conversations/pinned`

**Description:** Returns all conversations that the user has pinned.

**Success Response:**

```json
[
  {
    "_id": "conv123",
    "participants": ["user1", "user2"],
    "lastMessage": {
      "content": "Important message",
      "sender": "user1",
      "createdAt": "2025-06-20T10:00:00Z"
    },
    "updatedAt": "2025-06-20T10:00:00Z"
  }
]
```

**Error Response:**

```json
{
  "error": "Failed to fetch pinned conversations"
}
```

---

## 11. Pin/Unpin a Message

**Endpoint:** `PUT /messages/:messageId/pin`

**Description:** Toggles the pin status of a specific message.

**Success Response:**

```json
{
  "message": "Message pin status updated",
  "data": {
    "_id": "msg123",
    "isPinned": true
  }
}
```

**Error Response:**

```json
{
  "error": "You don't have permission to pin this message"
}
```

---

## Error Responses

Common errors include:

```json
{
  "error": "Conversation not found"
}
```

```json
{
  "error": "Forbidden: You are not a participant in this conversation"
}
```

```json
{
  "error": "Failed to fetch unread conversations"
}
```

---

## Notes

* All endpoints require authentication via JWT.
* You must be a participant in a conversation to modify it.
* Fields such as `pinnedUsers`, `archivedUsers`, and `mutedUsers` are managed per user using toggle actions.
