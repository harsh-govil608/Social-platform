import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['friend_request', 'friend_accept', 'post_like', 'post_comment', 'post_share', 'message', 'mention', 'follow'],
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'entityModel'
    },
    entityModel: {
        type: String,
        enum: ['Post', 'FriendRequest', 'User', 'Message']
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    }
}, { timestamps: true });

// Index for faster queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;