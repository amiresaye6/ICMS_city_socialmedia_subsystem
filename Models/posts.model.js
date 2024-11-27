const postSchema = new Schema(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        availability: {
            type: String,
            enum: ['public', 'private', 'friends', 'specific_groups'],
            default: 'public'
        },
        postCaption: {
            type: String
        },
        media: [
            {
                type: {
                    type: String,
                    enum: ['image', 'video', 'audio'],
                    required: true
                },
                url: {
                    type: String,
                    required: true
                },
            }
        ],
        impressionsCount: {
            // To aggregate reaction counts
            like: {
                type: Number,
                default: 0
            },
            love: {
                type: Number,
                default: 0
            },
            care: {
                type: Number,
                default: 0
            },
            laugh: {
                type: Number,
                default: 0
            },
            sad: {
                type: Number,
                default: 0
            },
            hate: {
                type: Number,
                default: 0
            },
            total: {
                type: Number,
                default: 0
            },
        },
        impressionList: [
            {
                // For detailed reaction tracking
                userId: {
                    type: Schema.Types.ObjectId,
                    ref: 'User'
                },
                impressionType: {
                    type: String
                }
            }
        ],
        shareCount: {
            type: Number,
            default: 0
        },
        shareList: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        comments: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Comment'
            }
        ],
        tags: [
            {
                type: String
            }
        ],
        status: {
            type: String,
            enum: ['active', 'archived', 'deleted'],
            default: 'active'
        },
        saveCount: {
            type: Number,
            default: 0
        },
        saveList: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        flags: [
            {
                userId: {
                    type: Schema.Types.ObjectId,
                    ref: 'User'
                },
                reason: {
                    type: String
                },
                date: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
    },
    {
        timestamps: true
    });

module.exports = mongoose.model('Post', postSchema);
