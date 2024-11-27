const reactSchema = new Schema(
    {
        targetId: {
            type: Schema.Types.ObjectId,
            required: true
        }, // Can point to a post, comment, etc.
        targetType: {
            type: String,
            enum: ['Post', 'Comment'],
            required: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        reactionType: {
            type: String,
            required: true
        }, // e.g., 'like', 'love', 'care', 'sad'
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('React', reactSchema);
