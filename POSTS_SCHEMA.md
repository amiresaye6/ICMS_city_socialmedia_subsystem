# Posts Schema

## Overview
The posts schema is designed to support the functionality of the city social media platform, allowing citizens to create, share, and interact with posts related to city issues and community events. This schema incorporates various media types, user interactions, and privacy settings to facilitate a rich user experience.

## Schema Structure

### Post
```javascript
post = {
    authorId: ObjectId, // ID of the creator of the post to get his data
    availability: Enum('public', 'private', 'friends', 'specific_groups'), // Visibility of the post
    postCaption: String, // The actual post text that will appear at the top of it
    media: [ // Enhanced media support
        {
            type: String, // e.g., 'image', 'video', 'audio'
            url: String, // URL to the media
            thumbnailUrl: String, // Optional thumbnail for previews
            duration: Number // Optional duration for video/audio
        }
    ],
    impressionsCount: {
        reactOne: Number, // Number of impressions for this reaction
        reactTwo: Number, // Number of impressions for this reaction
        reactThree: Number // Number of impressions for this reaction
    },
    impressionList: [ // List of user impressions
        {
            userId: ObjectId, // The user ID that added a certain impression
            impressionType: String // Type of impression (e.g., love, like, care, hate, sad, etc.)
        }
    ],
    shareCount: Number, // Count of users sharing this post
    shareList: [ObjectId], // List of user IDs who shared the post
    comments: [ // List of comments on the post
        {
            userId: ObjectId, // User ID that added the comment
            commentContent: Var, // The actual content of the comment (text, image, video, audio)
            date: Date, // When this comment is added
            replies: [ // Enhanced reply structure for multi-level comments
                {
                    userId: ObjectId, // User that added the reply
                    commentContent: Var, // Content of the reply
                    date: Date, // When this reply was added
                    replies: [ /* Nested replies */ ] // Further nesting for replies
                }
            ],
            reacts: { // Reaction counts for comments
                reactsCount: Number, // Total count of reactions to the comment
                usersList: [ObjectId] // List of users who reacted to the comment
            }
        }
    ],
    date: Date, // When this post is added
    createdAt: Date, // Timestamp when the post was created
    updatedAt: Date, // Timestamp for the last update of the post
    tags: [String], // Array of tags for categorization
    status: Enum('active', 'archived', 'deleted'), // Status of the post
    saveCount: Number, // Count of saves/bookmarks for the post
    saveList: [ObjectId], // List of user IDs who saved the post
    notifications: [ // Notification system for mentions
        {
            userId: ObjectId, // User ID to notify
            postId: ObjectId, // Related post ID
            type: String, // Type of notification (e.g., mention, reply)
            date: Date // Date of the notification
        }
    ],
    flags: [ // Moderation flags for inappropriate content
        {
            userId: ObjectId, // User ID who flagged the content
            reason: String, // Reason for flagging
            date: Date // Date when flagged
        }
    ],
    commentVersions: [ // Version control for comments
        {
            content: Var, // Historical content of the comment
            dateModified: Date // When this version was modified
        }
    ]
}
```

## Explanation of Relationships
1. **Author**: Each post is linked to an author through the `authorId`, allowing you to retrieve the author's information easily.
2. **Impressions**: Users can react to a post in various ways, with counts maintained in `impressionsCount` and detailed records in `impressionList`.
3. **Shares**: The `shareCount` and `shareList` allow tracking of how many users shared the post and who they are.
4. **Comments and Replies**: Each comment can have its own replies, allowing for threaded discussions, and reactions can be counted for each comment.
5. **Tags**: Tags help categorize posts, making it easier for users to find relevant content.
6. **Privacy Settings**: The `availability` field allows posts to have different visibility settings, accommodating user privacy needs.
7. **Moderation and Notifications**: Flags and notifications ensure that inappropriate content can be reported and users are alerted to relevant interactions.

This schema provides a comprehensive framework for managing posts, their interactions, and user engagement within your city social media platform. If you have any questions or need further adjustments, feel free to ask!
