const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema(
    {
        postId: {
            type: Schema.Types.ObjectId,
            ref: 'Post',
            required: true
        },
        parentCommentId: {
            type: Schema.Types.ObjectId,
            ref: 'Comment',
            default: null
        },
        userId: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        replies: [{
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }],
        reactions: [{
            userId: String,
            impressionType: String
        }]
    },
    {
        timestamps: true
    });

// Virtual for reaction count
commentSchema.virtual('reactionCount').get(function () {
    return this.reactions.length;
});

// Indexes for performance
commentSchema.index({ postId: 1 });
commentSchema.index({ userId: 1 });

module.exports = mongoose.model('Comment', commentSchema);
