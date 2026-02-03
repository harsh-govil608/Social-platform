import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema=new mongoose.Schema({
    fullName:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
        minlength: 6
    },
    bio:{
        type: String,
        default: "",
    },
    profilePic:{
        type: String,
        default: "",
    },
    nativeLanguage:{
        type: String,
        default:"",
    },
    learningLanguage:{
        type: String,
        default: "",
    },
    location: {
        type: String,
        default: "",
    },
    isOnboarded: {
        type: Boolean,
        default: false,
    },
    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    blockedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    isOnline: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    privacySettings: {
        profileVisibility: {
            type: String,
            enum: ['public', 'friends', 'private'],
            default: 'public'
        },
        showOnlineStatus: {
            type: Boolean,
            default: true
        },
        allowMessages: {
            type: String,
            enum: ['everyone', 'friends', 'none'],
            default: 'friends'
        }
    },
    socialLinks: {
        instagram: String,
        twitter: String,
        linkedin: String,
        facebook: String
    },
    interests: [{
        type: String
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String,
        default: null
    },
    emailVerificationExpires: {
        type: Date,
        default: null
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    deletionRequested: {
        type: Boolean,
        default: false
    },
    deletionRequestedAt: {
        type: Date,
        default: null
    },
    // Gamification - simplified to streak only
    streak: {
        type: Number,
        default: 0
    },
    lastPracticeDate: {
        type: Date,
        default: null
    },
    bestStreak: {
        type: Number,
        default: 0
    },
    // Partner matching fields
    timezone: {
        type: String,
        default: ''
    },
    learningGoals: [{
        type: String
    }],
    availability: [{
        day: {
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        },
        startHour: {
            type: Number,
            min: 0,
            max: 23
        },
        endHour: {
            type: Number,
            min: 0,
            max: 23
        }
    }],
    languageProficiency: {
        type: String,
        enum: ['beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced', 'native'],
        default: 'beginner'
    },
    partnerPreferences: {
        ageRange: {
            min: { type: Number, default: 18 },
            max: { type: Number, default: 99 }
        },
        preferredProficiency: [{
            type: String,
            enum: ['beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced', 'native']
        }],
        communicationStyle: {
            type: String,
            enum: ['casual', 'structured', 'both'],
            default: 'both'
        }
    },
    // AI tutor preferences
    aiPreferences: {
        preferredTutor: {
            type: String,
            enum: ['friendly', 'professional', 'challenging', 'playful'],
            default: 'friendly'
        }
    }
},{timestamps: true});
userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    try{
        const salt=await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch(error){
        next(error);
    }
})
userSchema.methods.matchPassword = async function(enteredPassword){
    const isPasswordCorrect = await bcrypt.compare(enteredPassword,this.password);
    return isPasswordCorrect;
}
const User = mongoose.model("User",userSchema);
export default User;
