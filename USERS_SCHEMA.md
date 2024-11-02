# City Social Platform Subsystem

## Project Overview
A social media platform for citizens to connect with and engage with city-related issues, enhancing communication between citizens and city authorities.

## Schemas

### 1. User Schema
- **Purpose**: To store information about the users of the platform.
- **Fields**:
  - `userId`: ObjectId (unique identifier for the user)
  - `username`: String (user's chosen name)
  - `email`: String (user's email address)
  - `password`: String (hashed password)
  - `role`: Enum (indicates if the user is a citizen or a city authority)
  - `department`: String (for city authorities, to specify their department)
  - `createdAt`: Date (timestamp of when the user was created)
  - `profileImage`: String (URL of the user's profile picture, optional)

### 2. Comment Schema
- **Purpose**: To store comments made by users on posts.
- **Fields**:
  - `commentId`: ObjectId (unique identifier for the comment)
  - `postId`: ObjectId (ID of the post the comment belongs to)
  - `userId`: ObjectId (ID of the user who made the comment)
  - `commentContent`: Var (the actual content of the comment)
  - `date`: Date (timestamp of when the comment was created)
  - `replies`: [ // Nested replies
      {
          userId: ObjectId, // User ID that added the reply
          commentContent: Var, // Content of the reply
          date: Date // When this reply was added
      }
  ]
  - `reacts`: { // Reaction counts for comments
      reactsCount: Number, // Total count of reactions to the comment
      usersList: [ObjectId] // List of users who reacted to the comment
  }

### 3. Alert Schema
- **Purpose**: To manage city alerts and important updates.
- **Fields**:
  - `alertId`: ObjectId (unique identifier for the alert)
  - `title`: String (short title of the alert)
  - `description`: String (detailed information about the alert)
  - `date`: Date (timestamp of when the alert was created)
  - `type`: Enum (e.g., "emergency", "maintenance", "information")

### 4. Post Schema
- **Purpose**: To manage user-generated posts on the platform.
- **Fields**:
  - `postId`: ObjectId (unique identifier for the post)
  - `authorId`: ObjectId (ID of the creator of the post)
  - `availability`: Enum('public', 'private', 'friends', 'specific_groups') (visibility of the post)
  - `postCaption`: String (the actual post text that will appear at the top of it)
  - `media`: [ // Enhanced media support
      {
          type: String, // e.g., 'image', 'video', 'audio'
          url: String, // URL to the media
          thumbnailUrl: String, // Optional thumbnail for previews
          duration: Number // Optional duration for video/audio
      }
  ]
  - `impressionsCount`: { // Counts of different types of impressions
      reactOne: Number, // Number of impressions for this reaction
      reactTwo: Number, // Number of impressions for this reaction
      reactThree: Number // Number of impressions for this reaction
  }
  - `impressionList`: [ // List of user impressions
      {
          userId: ObjectId, // The user ID that added a certain impression
          impressionType: String // Type of impression (e.g., love, like, care, hate, sad, etc.)
      }
  ]
  - `shareCount`: Number (count of users sharing this post)
  - `shareList`: [ObjectId] (list of user IDs who shared the post)
  - `comments`: [ // List of comments on the post
      {
          userId: ObjectId, // User ID that added the comment
          commentContent: Var, // The actual content of the comment (text, image, video, audio)
          date: Date, // When this comment is added
          replies: [ // Enhanced reply structure for multi-level comments
              {
                  userId: ObjectId, // User that added the reply
                  commentContent: Var, // Content of the reply
                  date: Date // When this reply was added
              }
          ],
          reacts: { // Reaction counts for comments
              reactsCount: Number, // Total count of reactions to the comment
              usersList: [ObjectId] // List of users who reacted to the comment
          }
      }
  ]
  - `date`: Date (when this post is added)
  - `createdAt`: Date (timestamp when the post was created)
  - `updatedAt`: Date (timestamp for the last update of the post)
  - `tags`: [String] (array of tags for categorization)
  - `status`: Enum('active', 'archived', 'deleted') (status of the post)
  - `saveCount`: Number (count of saves/bookmarks for the post)
  - `saveList`: [ObjectId] (list of user IDs who saved the post)
  - `notifications`: [ // Notification system for mentions
      {
          userId: ObjectId, // User ID to notify
          postId: ObjectId, // Related post ID
          type: String, // Type of notification (e.g., mention, reply)
          date: Date // Date of the notification
      }
  ]
  - `flags`: [ // Moderation flags for inappropriate content
      {
          userId: ObjectId, // User ID who flagged the content
          reason: String, // Reason for flagging
          date: Date // Date when flagged
      }
  ]
  - `commentVersions`: [ // Version control for comments
      {
          content: Var, // Historical content of the comment
          dateModified: Date // When this version was modified
      }
  ]
