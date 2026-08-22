import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { log } from "../lib/logger.js";
export async function signup(req,res){
    const { email, password, fullName}=req.body;
    try{
        if(!email || !password || !fullName){
            return res.status(400).json({
                success: false, message: "All fields are required"
            });
        }
        if(password.length<6){
            return res.status(400).json({
                success: false, message: "Password must be atleast 6 character"
            });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({
                success: false, message: "Invalid email format"
            });
        }
        const existingUser= await User.findOne({email});
        if(existingUser){
            return res.status(400).json({ success: false, message: "Email already exists, please use a different one"});
        }
        const idx=Math.floor(Math.random()*100)+1;
        const randomAvatar=`https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = await User.create({
            email,
            fullName,
            password,
            profilePic: randomAvatar
        })
        
        // LearningProgress will be created automatically when user first accesses learning features
        
        try{
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePic || "",
            });
            log.debug("Stream user created", { userId: newUser._id, fullName: newUser.fullName });
        }catch(error){
            log.warn("Error creating Stream user", { error: error.message || error });
            // Continue with user creation even if Stream fails
        }
        const token=jwt.sign({userId: newUser._id}, process.env.JWT_SECRET_KEY,{
            expiresIn: "7d"
        })
        res.cookie("jwt",token,{
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            secure: process.env.NODE_ENV === "production"
        })
        res.status(201).json({success: true, user: newUser})
    } catch(error){
        log.error("Error in signup", { error: error.message });
        res.status(500).json({
            success: false, message: "Internal server error"
        });
    }
}
export async function login(req,res){
    try{
    const {email, password}=req.body;
    if(!email || !password){
        return res.status(400).json({
            success: false, message: "All fields are required"
        });
    }
    const user = await User.findOne({email});
    if(!user){
        return res.status(401).json({ success: false, message: "Invalid email or password"})
    }
    const isPasswordCorrect= await user.matchPassword(password);
    if(!isPasswordCorrect) return res.status(401).json({ success: false, message: "Invalid email or password"});
    const token= jwt.sign({ userId: user._id},process.env.JWT_SECRET_KEY,{
        expiresIn: "7d",
    });
    res.cookie("jwt",token,{
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        secure: process.env.NODE_ENV === "production"
    });
    res.status(200).json({
        success: true, user
    });
}catch(error){
    log.error("Error in login controller", { error: error.message });
    res.status(500).json({ success: false, message: "Internal server error "});
}
}

export function logout(req,res){
    res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        secure: process.env.NODE_ENV === "production"
    });
    res.status(200).json({ success: true, message: "Logout successful"});
}

export async function onboard(req,res){
    try{
        const userId = req.user._id
        const currentUser = await User.findById(userId);
        if (!currentUser) return res.status(404).json({ success: false, message: "User not found"});

        // If user is already onboarded, this is a profile update
        if (currentUser.isOnboarded) {
            const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;
            const updateFields = {};
            if (fullName !== undefined) updateFields.fullName = fullName;
            if (bio !== undefined) updateFields.bio = bio;
            if (nativeLanguage !== undefined) updateFields.nativeLanguage = nativeLanguage;
            if (learningLanguage !== undefined) updateFields.learningLanguage = learningLanguage;
            if (location !== undefined) updateFields.location = location;

            const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });
            return res.status(200).json({ success: true, user: updatedUser });
        }

        // First-time onboarding flow
        const {learningLanguage, proficiencyLevel, dailyAvailability} = req.body
        if(!learningLanguage || !proficiencyLevel || !dailyAvailability){
            return res.status(400).json({ success: false, message: "All fields are required",
                missingFields: [
                    !learningLanguage && "learningLanguage",
                    !proficiencyLevel && "proficiencyLevel",
                    !dailyAvailability && "dailyAvailability",
                ].filter(Boolean),
            });
        }
        const updatedUser = await User.findByIdAndUpdate(userId,{
            learningLanguage,
            languageProficiency: proficiencyLevel,
            dailyAvailability,
            isOnboarded: true,
        }, {new: true})
        if(!updatedUser) return res.status(404).json({ success: false, message: "User not found"});
        try{
        await upsertStreamUser({
            id: updatedUser._id.toString(),
            name: updatedUser.fullName,
            image: updatedUser.profilePic || "",
        })
        log.debug("Stream user updated after onboarding", { userId: updatedUser._id, fullName: updatedUser.fullName });
        }catch(streamError) {
            log.warn("Error updating Stream user during onboarding", { error: streamError.message });
        }
        res.status(200).json({ success: true, user: updatedUser});

    } catch(error){
        log.error("Onboarding error", { error: error.message });
        res.status(500).json({ success: false, message: "Internal server error"});

    }
}