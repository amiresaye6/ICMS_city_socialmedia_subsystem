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

## 12. Create a Group Conversation

**Endpoint:** `POST /group`

**Description:** Creates a new group conversation with multiple participants.

**Body:**

```json
{
  "name": "Project Team",
  "participants": ["user1", "user2", "user3"],
  "description": "Group for project discussion",
  "avatar": "https://example.com/group-avatar.jpg"
}
```

**Success Response:**

```json
{
  "message": "Group conversation created successfully",
  "conversation": {
    "_id": "conv123",
    "name": "Project Team",
    "participants": ["user1", "user2", "user3"],
    "isGroup": true,
    "groupAdmin": "user1",
    "groupSettings": {
      "description": "Group for project discussion",
      "avatar": "https://example.com/group-avatar.jpg"
    }
  }
}
```

**Error Response:**

```json
{
  "error": "Invalid input. Group name and at least 2 participants are required"
}
```

---

## 13. Update Group Settings

**Endpoint:** `PUT /:conversationId/group-settings`

**Description:** Updates settings for a group conversation. Only the group admin can perform this action.

**Body:**

```json
{
  "name": "Updated Group Name",
  "description": "Updated description",
  "avatar": "https://example.com/new-avatar.jpg",
  "permissions": {
    "sendMessages": "all",
    "addMembers": "admins",
    "removeMembers": "admins",
    "editGroupInfo": "admins"
  }
}
```

**Success Response:**

```json
{
  "message": "Group settings updated successfully",
  "conversation": {
    "_id": "conv123",
    "name": "Updated Group Name",
    "groupSettings": {
      "description": "Updated description",
      "avatar": "https://example.com/new-avatar.jpg",
      "permissions": {
        "sendMessages": "all",
        "addMembers": "admins",
        "removeMembers": "admins",
        "editGroupInfo": "admins"
      }
    }
  }
}
```

**Error Response:**

```json
{
  "error": "Forbidden: Only group admin can update group settings"
}
```

---

## 14. Generate Group Join Link

**Endpoint:** `POST /:conversationId/join-link`

**Description:** Generates or refreshes a join link for a group conversation. Only the group admin can perform this action.

**Body:**

```json
{
  "expiryHours": 24
}
```

**Success Response:**

```json
{
  "message": "Join link generated successfully",
  "joinLink": "http://graduation.amiralsayed.me/join/abc123def456",
  "expiresAt": "2025-06-21T10:00:00Z"
}
```

**Error Response:**

```json
{
  "error": "Forbidden: Only group admin can generate join links"
}
```

---

## 15. Join Group with Link

**Endpoint:** `POST /join/:joinCode`

**Description:** Allows a user to join a group conversation using a join link.

**Success Response:**

```json
{
  "message": "Successfully joined the group",
  "conversation": {
    "_id": "conv123",
    "name": "Project Team",
    "participants": ["user1", "user2", "user3", "user4"]
  }
}
```

**Error Response:**

```json
{
  "error": "Invalid or expired join link"
}
```

---

## 16. Leave Group

**Endpoint:** `POST /:conversationId/leave`

**Description:** Allows a user to leave a group conversation.

**Success Response:**

```json
{
  "message": "You have left the group successfully"
}
```

**Error Response:**

```json
{
  "error": "This is not a group conversation"
}
```

---

## 17. Update User Settings for Conversation

**Endpoint:** `PUT /:conversationId/user-settings`

**Description:** Updates user-specific settings for a conversation.

**Body:**

```json
{
  "nickname": "Team Lead",
  "color": "#FF5733",
  "notifications": true
}
```

**Success Response:**

```json
{
  "message": "User settings updated successfully",
  "settings": {
    "userId": "user1",
    "nickname": "Team Lead",
    "color": "#FF5733",
    "notifications": true
  }
}
```

**Error Response:**

```json
{
  "error": "Forbidden: You are not a participant in this conversation"
}
```

---

## 18. Delete Conversation for User

**Endpoint:** `DELETE /:conversationId/user`

**Description:** Soft deletes a conversation for a specific user. The conversation will no longer appear in the user's conversation list.

**Success Response:**

```json
{
  "message": "Conversation deleted successfully for you"
}
```

**Error Response:**

```json
{
  "error": "Forbidden: You are not a participant in this conversation"
}
```

---

## 19. Get Archived Conversations

**Endpoint:** `GET /archived`

**Description:** Returns all conversations that the user has archived.

**Success Response:**

```json
[
  {
    "_id": "conv123",
    "participants": ["user1", "user2"],
    "lastMessage": {
      "content": "Archived message",
      "sender": "user1",
      "createdAt": "2025-06-20T10:00:00Z"
    },
    "updatedAt": "2025-06-20T10:00:00Z",
    "isArchived": true
  }
]
```

**Error Response:**

```json
{
  "error": "Failed to fetch archived conversations"
}
```

---

## 20. Get Muted Conversations

**Endpoint:** `GET /muted`

**Description:** Returns all conversations that the user has muted.

**Success Response:**

```json
[
  {
    "_id": "conv123",
    "participants": ["user1", "user2"],
    "lastMessage": {
      "content": "Muted message",
      "sender": "user1",
      "createdAt": "2025-06-20T10:00:00Z"
    },
    "updatedAt": "2025-06-20T10:00:00Z",
    "isMuted": true
  }
]
```

**Error Response:**

```json
{
  "error": "Failed to fetch muted conversations"
}
```

---

## API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/:userId` | GET | Get all conversations for a user |
| `/` | POST | Create a new conversation |
| `/:conversationId` | DELETE | Delete a conversation |
| `/:conversationId/rename` | PUT | Rename a conversation |
| `/:conversationId/participants` | PUT | Update participants |
| `/:conversationId/unread` | GET | Get unread conversations |
| `/:conversationId/pin/:userId` | PUT | Pin/unpin a conversation |
| `/:conversationId/archive/:userId` | PUT | Archive/unarchive a conversation |
| `/:conversationId/mute/:userId` | PUT | Mute/unmute a conversation |
| `/pinned` | GET | Get pinned conversations |
| `/group` | POST | Create a group conversation |
| `/:conversationId/group-settings` | PUT | Update group settings |
| `/:conversationId/join-link` | POST | Generate group join link |
| `/join/:joinCode` | POST | Join group with link |
| `/:conversationId/leave` | POST | Leave group |
| `/:conversationId/user-settings` | PUT | Update user settings |
| `/:conversationId/user` | DELETE | Delete conversation for user |
| `/archived` | GET | Get archived conversations |
| `/muted` | GET | Get muted conversations |

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
