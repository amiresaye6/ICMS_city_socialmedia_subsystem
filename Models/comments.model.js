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
        date: {
            type: Date,
            default: Date.now
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
        reacts: {
            reactsCount: {
                type: Number,
                default: 0
            },
            usersList: [{
                type: Schema.Types.ObjectId,
                ref: 'User'
            }]
        },
    },
    {
        timestamps: true
    });

module.exports = mongoose.model('Comment', commentSchema);
