const express = require("express");
const router = express.Router();
const User = require("../models/User")
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken"); 
const nodemailer = require("nodemailer"); 
require("dotenv").config();


const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
    },
});



function isEmail(value) {
    return typeof value === 'string' && /\S+@\S+\.\S+/.test(value);
}
function isPhoneE164(value){
    return typeof value === 'string' && /^\+\d{10,15}$/.test(value);
}
function isPassword(value){
    return typeof value === 'string' && value.length >= 6;
}


router.post("/register", async(req, res) => {
    const { name, email, password, phone} = req.body;
    
    if (!name || typeof name != 'string' || name.trim === '') 
        return res.status(400).json({ message: 'Name is required' });
    if (!email || !isEmail(email))
         return res.status(400).json({ message: 'Valid email is required' });
    if (!password || !isPassword(password))
        return res.status(400).json({ message: 'Password must be at least 6 caracters' });
    if (!phone || !isPhoneE164(phone))
        return res.status(400).json({ message: 'Phone is required in E.164 format (eg. +1234567890)' });

    try{
        const existingUser = await User.findOne({email});
        if(existingUser) return res.status(400).json({ message: "User already exists"});

        const hashedPassword = await bcrypt.hash(password, 10); 
        const user = new User({ name, email, phone, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET, 
            {expiresIn: "1h"}); 


        const BACKEND_URL = process.env.BACKEND_URL;
        const url = `${BACKEND_URL}/api/auth/verify/${token}`;
        
        await transporter.sendMail({ 
            to:email,
            subject: "Verify your email",
            html: `<h3>Click <a href="${url}">here</a> to verify your email</h3>`,
        });

        res.status(201).json({ message: "User registered. Check your email to verify."});
    }
    catch(err) {
        res.status(500).json({message:err.message});
    }
});

router.get("/verify/:token", async (req, res) => {
    try {
        const { id } = jwt.verify(req.params.token, process.env.JWT_SECRET);
        await User.findByIdAndUpdate(id, { isVerified: true });

        const FRONTEND = process.env.FRONTEND_URL || "http://localhost:5173";
        return res.redirect(`${FRONTEND}/login?verified=1`);

    } 
    catch (err) {
        res.status(400).send("Invalid or expired link");
    }
});


router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !isEmail(email))
        return res.status(400).json({ message: "Valid email is required" });

    if (!password || !isPassword(password))
        return res.status(400).json({ message: "Password must be at least 6 characters" });

    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: "User not found" });

        if (!user.isVerified)
            return res.status(400).json({ message: "Email not verified" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Incorrect password" });

        const payload = { 
            id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role || "user" 
        };

        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,        
            sameSite: "none",    // allow cross-site
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });


        res.json({ message: "Login successful", accessToken });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    if (!email || !isEmail(email))
        return res.status(400).json({ message: "Valid email is required" });

    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.resetOtp = otp;
        user.resetOtpExpire = Date.now() + 10 * 60 * 1000; 
        await user.save();

        await transporter.sendMail({
            to: email,
            subject: "Password Reset OTP",
            html: `<h3>Your password reset OTP is: <b>${otp}</b></h3>
                   <p>This OTP is valid for 10 minutes.</p>`,
        });

        res.json({ message: "Password reset OTP sent to email" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});




router.post("/refresh", async (req, res) => {
    try{
        const token = req.cookies?.refreshToken;
        if(!token) return res.status(401).json({ message: "No refresh token" });

        let decoded;
        try{
            decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        } catch(e) {
            return res.status(401).json({ message: "Invalid refresh token"});
        }

        const user = await User.findById(decoded.id);
        if(!user || user.refreshToken !== token) return res.status(401).json({ message: 
            "Invalid refresh token"});

        const payload = { id: user._id, name: user.name, email: user.email, 
            role: user.role || 'user'}

        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "15m"})

       
        res.json({ accessToken });
        }
        catch(err) {
            res.status(500).json({ message: err.message });
        }
    
});



router.post("/reset-password", async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !isEmail(email))
        return res.status(400).json({ message: "Valid email is required" });

    if (!otp || !/^\d{6}$/.test(otp))
        return res.status(400).json({ message: "Valid OTP required" });

    if (!newPassword || !isPassword(newPassword))
        return res.status(400).json({ message: "Password must be at least 6 characters" });

    try {
        const user = await User.findOne({
            email,
            resetOtp: otp,
            resetOtpExpire: { $gt: Date.now() }
        });

        if (!user)
            return res.status(400).json({ message: "Invalid or expired OTP" });

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetOtp = null;
        user.resetOtpExpire = null;

        await user.save();

        res.json({ message: "Password reset successful" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/verify-reset-otp", async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email, resetOtp: otp, resetOtpExpire: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });

  res.json({ message: "OTP verified successfully" });
});


router.post("/logout", async (req, res) => {
    try{
        const token = req.cookies?.refreshToken;
        if(token) {
            const user = await User.findOne({ refreshToken: token});
            if(user) {
                user.refreshToken = null;
                await user.save();
            }
        }
        // res.clearCookie("refreshToken", { httpOnly: true, sameSite: "lax"});
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        }); 
        
        res.json({ message: "Logged out "});
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
});






module.exports = router;