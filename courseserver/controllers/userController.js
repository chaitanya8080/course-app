import { User } from "../models/UserModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import { sendToken } from "../utils/sendToken.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "please add all fields" });
    }
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "user already exist" });
    }

    // upload on cloudinary

    user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: "tempid",
        url: "tempurl",
      },
    });

    sendToken(res, user, "Register Successfully", 201);
  } catch (error) {
    return res.status(400).json({ error });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "please add all fields" });
    }
    let user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Incorrect Email or password" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect Email or password" });
    }

    sendToken(res, user, `Welcome back ${user.name}`, 201);
  } catch (error) {
    return res.status(400).json({ error });
  }
};

//logout User
export const logout = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
      })
      .json({ success: true, message: "Logged Out Successfully" });
  } catch (error) {
    return res.status(400).json({ error });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(400).json({ error });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "please add all fields" });
    }

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "incorrect Old Password" });
    }

    user.password = newPassword;

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password Changed Successfully" });
  } catch (error) {
    return res.status(400).json({ error });
  }
};



export const updateProfile = async (req, res, next) => {
  const { name, email } = req.body;
  try {
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();
   
    res.status(200).json({
      success:true,
      message:"Profile Updated Sussessfully"
    })


  } catch (error) {
    return res.status(400).json(error.message);
  }
};



export const updateprofilepicture = async(req,res,next)=>{
  try {
    res.status(200).json({success:true,message:"profilePic updated"})
  } catch (error) {
    return res.status(400).json(error.message);
  }
}


export const forgetPassword = async(req,res,next)=>{
  try {

    const {email} = req.body;
    const user  = await User.findOne({email})

    if(!user){
      return res.status(400).json({ message: "No user found" });
    }
  
    const resetToken = await user.getResetToken()

    await user.save();

    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

    const message = `click on the link to reset your password, ${url}`
    
    await sendEmail(user.email,"courseBundler Reset Password",message)

    res.status(200).json({success:true,message:`reset token is sent to user ${email}`})

  } catch (error) {
    return res.status(400).json(error.message);
  }
}

export const resetPassword = async(req,res,next)=>{
  try {

    const {token} = req.params;

    const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");


    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire:{$gt:Date.now()
      },
    })

    if(!user){
      return res.status(400).json({ message: "token is invalid or has been expired" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;


    await user.save();

    res.status(200).json({success:true,message:"password reset succesfully"})

  } catch (error) {
    return res.status(400).json(error.message);
  }
}

