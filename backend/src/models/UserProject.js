import mongoose from 'mongoose';

const userProjectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'java', 'cpp', 'rust']
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodingChallenge'
  },
  description: {
    type: String
  },
  tags: [{
    type: String
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  forks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastModified: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for faster queries
userProjectSchema.index({ userId: 1, lastModified: -1 });
userProjectSchema.index({ isPublic: 1, likes: -1 });

const UserProject = mongoose.model('UserProject', userProjectSchema);
export default UserProject;