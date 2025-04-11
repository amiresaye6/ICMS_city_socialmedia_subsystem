const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        centralUsrId: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'superAdmin'],
            default: 'user'
        },
        userName: {
            type: String,
            required: true
        },
        localUserName: {
            type: String,
            default: 'user name'
        },
        email: {
            type: String,
            unique: true,
            required: true
        },
        avatarUrl: {
            type: String,
            default: "/public/uploads/default.png"
        }, // Profile picture
        coverUrl: {
            type: String,
            default: "/public/uploads/default.png"
        },
        bio: {
            type: String,
            default: 'hi there!'
        }, // Optional bio
        friends: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        ], // List of friend user IDs
        posts: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Post'
            }
        ], // User's posts
        savedPosts: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Post'
            }
        ], // Saved/bookmarked posts
        sharedPosts: [
            {
                postId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Post'
                },
                shareCaption: {
                    type: String,
                    default: ''
                }
            }
        ], // Shared posts with captions
    },
    {
        timestamps: true
    });

// For future: Add text index if you want faster searches
// userSchema.index({ userName: 'text', localUserName: 'text' });

module.exports = mongoose.model('User', userSchema);
