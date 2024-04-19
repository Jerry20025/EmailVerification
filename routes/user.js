const express = require('express');
const router = express.Router();
const zod = require("zod");
const { User } = require("../db"); 
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const nodemailer = require("nodemailer");
 
const signupBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
  location: zod.string(),
  age: zod.string(),
  workDetails: zod.string(),
  otp: zod.string(),
});

function generateOtp() {
  const digits = "0123456789";
  let otp = '';
  for (var i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

router.post("/signup", async (req, res) => {
  try {
    const { success, error } = signupBody.safeParse(req.body);
    if (!success) {
      return res.status(411).json({ message: "Invalid data:", error }); 
    }
    
    const existingUser = await User.findOne({ username:req.body.username });
    if (existingUser) {
      return res.status(409).json({ message: "Email already taken" });
    }
    const otp = generateOtp();
    const username=req.body.username;
    const user = await User.create({
      username: username,
      password: req.body.password,
      location: req.body.location,
      age: req.body.age,
      workDetails: req.body.workDetails,
      otp: otp,
    });
    const userId = user._id;
    const token = jwt.sign({ userId }, JWT_SECRET);
    let transporter = await nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, 
        auth: {
            user: 'uriah.wuckert34@ethereal.email',
            pass: '7W7BNwfZsmNgbtVxWp',
        },
      });
      await transporter.sendMail({
        from: '"Account Manager" <uriah.wuckert34@ethereal.email>', 
        to: username, 
        subject:"Email Verification",
        text:otp,
        html: "<b>Your otp is in plaintext</b>",
      });
    res.json({
      message: "User created successfully (pending OTP verification)",
      token,
      username,
    });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
router.post("/verify",async (req,res)=>{
    const username=req.body.username
    const checkotp=req.body.checkotp;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Unauthorized: Missing or invalid token" });
    }

    const token = authHeader.split(' ')[1];
    try {
        const user = await User.findOne({ username });
        if (!user) {
          return res.status(409).json({ message: "Email doesn't exist" });
        }
        const decodedToken = jwt.verify(token, JWT_SECRET); 
        console.log("Decoded Token:", decodedToken);
      if (!decodedToken.userId) {
        return res.status(401).json({ message: "Unauthorized: Username mismatch in token and request" });
      }
  
        const otp = user.otp;
  
        if (otp !== checkotp) {
          return res.status(411).json({ message: "OTP not matched" });
        }
    
        res.json({
            message:"Email verified", 
            user });
      } catch (error) {
        console.error("Error in JWT:", error);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      }
})

module.exports = router;
