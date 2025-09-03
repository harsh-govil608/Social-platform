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
