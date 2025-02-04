import User from "../models/user.model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import ApiError from "../utils/apiError.js"
import ApiResponse from "../utils/apiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


export const registerUser=asyncHandler(async (req,res,next)=>{
    const {email,password}= req.body

    const existingUser= await User.findOne({where: {email}})
    if(existingUser) return next(new ApiError("User already exists",400))
    const hashedPassword= await bcrypt.hash(password,10);

    const newUser= await User.create({
        email,
        password:hashedPassword,
    });

    res.status(201).json(new ApiResponse(201,{userId: newUser.id},"User registered succesfully "))
})

export const loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
        return next(new ApiError("Invalid email or password", 400));
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return next(new ApiError("Invalid email or password", 400));
    }

    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.status(200).json(new ApiResponse(200, { token }, "Login successful"));
});

export const getCurrentUser = asyncHandler((req, res, next) => {
 
  if (!req.user) {
    return next(new ApiError("Not authenticated", 401));
  }


  res
    .status(200)
    .json(
      new ApiResponse(200, { user: req.user }, "User retrieved successfully")
    );
});



import users from "../models/users.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const updateUser = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const {
    name,
    registration_number,
    semester,
    branch,
    hostel,
    graduation_year,
  } = req.body;

  const user = await users.findByPk(userId);
  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  if (name !== undefined) user.name = name;
  if (registration_number !== undefined)
    user.registration_number = registration_number;
  if (semester !== undefined) user.semester = semester;
  if (branch !== undefined) user.branch = branch;
  if (hostel !== undefined) user.hostel = hostel;
  if (graduation_year !== undefined) user.graduation_year = graduation_year;

  await user.save();
  res
    .status(200)
    .json(new ApiResponse(200, { user }, "User updated successfully"));
});