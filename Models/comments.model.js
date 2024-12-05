const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema(
    {
        postId: {
            type: Schema.Types.ObjectId,
            ref: 'Post',
            required: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true
        },
        replies: [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            content: {
                type: String,
                required: true
            },
            date: {
                type: Date,
                default: Date.now
            },
            replies: [{
                type: Schema.Types.ObjectId,
                ref: 'Comment'
            }] // Recursive reference for nested replies
        }],
        ReactsLIst: {
            count: {
                type: Number,
                default: 0
            },
            list: [
                {
                    userId: {
                        type: Schema.Types.ObjectId,
                        ref: 'User',
                        required: true
                    },
                    impressionType: {
                        type: String,
                        enum: ['like', 'love', 'care', 'laugh', 'sad', 'hate'],
                        required: true
                    }
                }
            ]
        },
    },
    {
        timestamps: true
    });

module.exports = mongoose.model('Comment', commentSchema);
