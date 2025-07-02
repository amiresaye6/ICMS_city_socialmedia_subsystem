# Typing Indicators Guide

## Overview
Real-time typing indicators using Socket.io for instant messaging. Shows when users are typing in conversations with automatic timeout and cleanup.

## Features
- ⌨️ **Real-time typing detection**
- ⏰ **Auto-timeout after 3 seconds**
- 🧹 **Automatic cleanup on disconnect**
- 📱 **Multi-user support**
- 🔄 **Live updates via WebSocket**

---

## Socket Events

### 1. Start Typing
**Event:** `typing`

**Emit from client:**
```javascript
socket.emit('typing', {
  conversationId: '64f8a1b2c3d4e5f6a7b8c9d0',
  userId: 'user123',
  userName: 'John Doe' // optional
});
```

**Received by others:**
```javascript
socket.on('user-typing', (data) => {
  console.log(`${data.userName} is typing...`);
  // data = {
  //   userId: 'user123',
  //   userName: 'John Doe',
  //   conversationId: '64f8a1b2c3d4e5f6a7b8c9d0',
  //   timestamp: '2024-01-15T10:30:00.000Z'
  // }
});
```

### 2. Stop Typing
**Event:** `stop-typing`

**Emit from client:**
```javascript
socket.emit('stop-typing', {
  conversationId: '64f8a1b2c3d4e5f6a7b8c9d0',
  userId: 'user123',
  userName: 'John Doe' // optional
});
```

**Received by others:**
```javascript
socket.on('user-stopped-typing', (data) => {
  console.log(`${data.userName} stopped typing`);
  // data = {
  //   userId: 'user123',
  //   userName: 'John Doe',
  //   conversationId: '64f8a1b2c3d4e5f6a7b8c9d0',
  //   reason: 'manual' | 'timeout' | 'disconnected',
  //   timestamp: '2024-01-15T10:30:00.000Z'
  // }
});
```

### 3. Get Typing Users
**Event:** `get-typing-users`

**Emit from client:**
```javascript
socket.emit('get-typing-users', {
  conversationId: '64f8a1b2c3d4e5f6a7b8c9d0'
});
```

**Response:**
```javascript
socket.on('typing-users-list', (data) => {
  console.log(`${data.count} users typing`);
  // data = {
  //   conversationId: '64f8a1b2c3d4e5f6a7b8c9d0',
  //   typingUsers: ['user123', 'user456'],
  //   count: 2,
  //   timestamp: '2024-01-15T10:30:00.000Z'
  // }
});
```

---

## Implementation Examples

### Frontend JavaScript
```javascript
class TypingIndicator {
  constructor(socket, conversationId, userId, userName) {
    this.socket = socket;
    this.conversationId = conversationId;
    this.userId = userId;
    this.userName = userName;
    this.isTyping = false;
    this.typingTimeout = null;
    
    this.setupListeners();
  }

  setupListeners() {
    // Listen for others typing
    this.socket.on('user-typing', (data) => {
      if (data.conversationId === this.conversationId && data.userId !== this.userId) {
        this.showTypingIndicator(data.userName);
      }
    });

    // Listen for others stopping typing
    this.socket.on('user-stopped-typing', (data) => {
      if (data.conversationId === this.conversationId && data.userId !== this.userId) {
        this.hideTypingIndicator(data.userName);
      }
    });
  }

  startTyping() {
    if (!this.isTyping) {
      this.isTyping = true;
      this.socket.emit('typing', {
        conversationId: this.conversationId,
        userId: this.userId,
        userName: this.userName
      });
    }

    // Reset timeout
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.stopTyping();
    }, 2500); // Stop slightly before server timeout
  }

  stopTyping() {
    if (this.isTyping) {
      this.isTyping = false;
      clearTimeout(this.typingTimeout);
      
      this.socket.emit('stop-typing', {
        conversationId: this.conversationId,
        userId: this.userId,
        userName: this.userName
      });
    }
  }

  showTypingIndicator(userName) {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.textContent = `${userName} is typing...`;
      indicator.style.display = 'block';
    }
  }

  hideTypingIndicator(userName) {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }
}

// Usage
const socket = io();
const typing = new TypingIndicator(socket, 'conv123', 'user123', 'John');

// On input field
document.getElementById('messageInput').addEventListener('input', () => {
  typing.startTyping();
});

// On send message
document.getElementById('sendButton').addEventListener('click', () => {
  typing.stopTyping();
});
```

### React Hook Example
```javascript
import { useEffect, useState } from 'react';

export const useTypingIndicator = (socket, conversationId, userId, userName) => {
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = (data) => {
      if (data.conversationId === conversationId && data.userId !== userId) {
        setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), data]);
      }
    };

    const handleUserStoppedTyping = (data) => {
      if (data.conversationId === conversationId) {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
      }
    };

    socket.on('user-typing', handleUserTyping);
    socket.on('user-stopped-typing', handleUserStoppedTyping);

    return () => {
      socket.off('user-typing', handleUserTyping);
      socket.off('user-stopped-typing', handleUserStoppedTyping);
    };
  }, [socket, conversationId, userId]);

  const startTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { conversationId, userId, userName });
    }
  };

  const stopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      socket.emit('stop-typing', { conversationId, userId, userName });
    }
  };

  return { typingUsers, startTyping, stopTyping, isTyping };
};
```

---

## Best Practices

### 1. **Debounce Typing Events**
```javascript
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const debouncedStartTyping = debounce(() => typing.startTyping(), 300);
```

### 2. **Handle Connection Issues**
```javascript
socket.on('disconnect', () => {
  // Clear typing indicators
  setTypingUsers([]);
  setIsTyping(false);
});

socket.on('reconnect', () => {
  // Rejoin conversation
  socket.emit('join-conversation', { conversationId, userId });
});
```

### 3. **UI Considerations**
- Show typing indicator below last message
- Limit display to 3 users max ("John, Jane and 2 others are typing...")
- Use subtle animations
- Clear indicators when new message arrives

---

## Error Handling

### Common Errors
```javascript
socket.on('error', (error) => {
  console.error('Typing error:', error);
  
  switch (error.code) {
    case 'MISSING_CONVERSATION_ID':
      // Handle missing conversation ID
      break;
    default:
      // Handle general errors
      break;
  }
});
```

---

## Performance Notes

- **Memory efficient**: Uses Map and Set for O(1) operations
- **Auto cleanup**: Removes inactive users automatically
- **Lightweight**: No database storage required
- **Scalable**: Handles multiple conversations simultaneously

---

## Troubleshooting

### Issue: Typing indicator stuck
**Solution**: Check auto-timeout (3 seconds) and manual stop events

### Issue: Multiple indicators for same user
**Solution**: Ensure proper cleanup in frontend when user stops typing

### Issue: Indicators not showing
**Solution**: Verify socket connection and conversation join events
