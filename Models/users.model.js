const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        avatarUrl: {
            type: String
        }, // Profile picture
        bio: {
            type: String
        }, // Optional bio
        friends: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        ], // List of friend user IDs
        groups: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Group'
            }
        ], // Group memberships (if applicable)
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
    },
    {
        timestamps: true
    });

module.exports = mongoose.model('User', userSchema);
