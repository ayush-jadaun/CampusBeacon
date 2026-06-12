import User from "../models/user.model.js";
import { Role, UserRole } from "../models/role.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/emailService.js";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
dotenv.config();

console.log(process.env.CLIENT_URL)
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/*
=============================
        Time and Date  
=============================
*/
const getCurrentUTCDateTime = () => {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace("T", " ");
};

/*
=============================
        Extract Registration Number and Graduation Year 
=============================
*/
const extractRegistrationDetails = (email) => {
  const registrationNumber = email.match(/\d{8}/)[0];
  const graduationYear = parseInt(registrationNumber.substring(0, 4)) + 4;
  return { registrationNumber, graduationYear };
};

/*
=============================
        Register User 
=============================
*/
export const registerUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) return next(new ApiError("User already exists", 400));

  const { registrationNumber, graduationYear } =
    extractRegistrationDetails(email);
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    email,
    password: hashedPassword,
    registration_number: registrationNumber,
    graduation_year: graduationYear,
    isVerified: false,
  });

  // Assign default role to new user
  const userRole = await Role.findOne({ where: { role_name: "user" } });
  if (userRole) {
    await UserRole.create({ user_id: newUser.id, role_id: userRole.role_id }); 
  }

  console.log(`New user registered at ${getCurrentUTCDateTime()}`);

  try {
    // Directly use the helper function instead of calling the API endpoint
    await sendVerificationEmailToUser(newUser);
  } catch (error) {
    return next(new ApiError("Error sending verification email", 500));
  }

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { userId: newUser.id },
        "User registered successfully. Please verify your email before logging in."
      )
    );
});

/*
=============================
        Login User 
=============================
*/
export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email }, include: Role });
  if (!user) return next(new ApiError("Invalid email or password", 400));
  if (!user.isVerified)
    return next(
      new ApiError("Please verify your email before logging in", 403)
    );

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return next(new ApiError("Invalid email or password", 400));

  const roles = user.Roles.map((role) => role.role_name);
  const token = jwt.sign(
    { id: user.id, email: user.email, roles },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  console.log(`User ${email} logged in at ${getCurrentUTCDateTime()}`);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: { id: user.id, email: user.email, roles }, token },
        "Login successful"
      )
    );
});

/*
==============================
       Get Current User 
==============================
*/

export const getCurrentUser = asyncHandler(async (req, res, next) => {
  if (!req.user) return next(new ApiError("Not authenticated", 401));

  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ["password"] },
    include: Role,
  });
  if (!user) return next(new ApiError("User not found", 404));

  const roles = user.Roles.map((role) => role.role_name);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: { ...user.toJSON(), roles } },
        "User retrieved successfully"
      )
    );
});

/*
==============================
       Update User 
==============================
*/
export const updateUser = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { name, semester, branch, hostel } = req.body;

  const user = await User.findByPk(userId, { include: Role });
  if (!user) return next(new ApiError("User not found", 404));

  if (name !== undefined) user.name = name;
  if (semester !== undefined) user.semester = semester;
  if (branch !== undefined) user.branch = branch;
  if (hostel !== undefined) user.hostel = hostel;

  await user.save();
  console.log(
    `User ${user.email} updated profile at ${getCurrentUTCDateTime()}`
  );

  const roles = user.Roles.map((role) => role.role_name);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: { ...user.toJSON(), roles } },
        "User updated successfully"
      )
    );
});

/*
==============================
       Forgot Password 
==============================
*/
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) return next(new ApiError("User not found", 404));

  const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: `Please click on the following link to reset your password: ${resetUrl}. This link will expire in 15 minutes.`,
      html: `
        <h1>Password Reset Request</h1>
        <p>Please click on the following link to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    console.log(
      `Password reset requested for ${email} at ${getCurrentUTCDateTime()}`
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, null, "Password reset instructions sent to email")
      );
  } catch (error) {
    return next(new ApiError("Error sending reset email", 500));
  }
});

/*
==============================
       Reset Password 
==============================
*/
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token, newPassword } = req.body;

  if (!token) return next(new ApiError("Reset token is required", 400));

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new ApiError("Invalid or expired token", 400));
  }

  const user = await User.findByPk(decoded.id);
  if (!user) return next(new ApiError("User not found", 404));

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  console.log(
    `Password reset completed for ${user.email} at ${getCurrentUTCDateTime()}`
  );

  try {
    await sendEmail({
      to: user.email,
      subject: "Password Changed Successfully",
      text: "Your password has been changed successfully. If you did not make this change, please contact support immediately.",
      html: `
        <h1>Password Changed Successfully</h1>
        <p>Your password has been changed successfully.</p>
        <p>If you did not make this change, please contact support immediately.</p>
      `,
    });
  } catch (error) {
    console.error("Error sending confirmation email:", error);
  }

  res.status(200).json(new ApiResponse(200, null, "Password reset successful"));
});

/*
==============================
       Logout User 
==============================
*/
export const logoutUser = asyncHandler(async (req, res, next) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });

  console.log(
    `User ${req.user.email} logged out at ${getCurrentUTCDateTime()}`
  );

  res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

/*
==============================
       Google Auth
==============================
*/
export const googleAuth = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  if (!idToken) return next(new ApiError("Google idToken is required", 400));

  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch (error) {
    return next(new ApiError("Invalid Google token", 400));
  }

  const payload = ticket.getPayload();
  if (!payload)
    return next(new ApiError("Google token payload not found", 400));

  const email = payload.email;
   if (!email.endsWith(".mnnit.ac.in")) {
     return next(
       new ApiError("Only MNNIT institutional emails are allowed", 403)
     );
   }
  let user = await User.findOne({ where: { email }, include: Role });
  if (!user) {
    const { registrationNumber, graduationYear } =
      extractRegistrationDetails(email);

    user = await User.create({
      email,
      name: payload.name,
      password: await bcrypt.hash(Math.random().toString(36), 10),
      registration_number: registrationNumber,
      graduation_year: graduationYear,
      isVerified: true, // Since Google auth already verifies the email.
    });

    // Assign default role to new user
    const userRole = await Role.findOne({ where: { role_name: "user" } });
    if (userRole) {
      await UserRole.create({ user_id: user.id, role_id: userRole.id });
    }

    console.log(`New user created via Google Auth for ${email}`);
  }

  const roles = user.Roles.map((role) => role.role_name);
  const token = jwt.sign(
    { id: user.id, email: user.email, roles },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  console.log(
    `User ${email} authenticated via Google at ${getCurrentUTCDateTime()}`
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          user: { id: user.id, email: user.email, name: user.name, roles },
          token,
        },
        "Google authentication successful"
      )
    );
});

/*
==============================
       Email Verification
==============================
*/
export const sendVerificationEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email }, include: Role });
  if (!user) return next(new ApiError("User not found", 404));

  try {
    await sendVerificationEmailToUser(user);
    res
      .status(200)
      .json(new ApiResponse(200, null, "Verification email sent successfully"));
  } catch (error) {
    return next(new ApiError("Error sending verification email", 500));
  }
});

export const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.query;

  if (!token) return next(new ApiError("Verification token is required", 400));

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new ApiError("Invalid or expired verification token", 400));
  }

  const user = await User.findByPk(decoded.id, { include: Role });
  if (!user) return next(new ApiError("User not found", 404));

  user.isVerified = true;
  await user.save();

  const roles = user.Roles.map((role) => role.role_name);
  const authToken = jwt.sign(
    { id: user.id, email: user.email, roles },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", authToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isVerified: true,
          roles,
        },
        token: authToken,
      },
      "Email verified successfully. You are now logged in."
    )
  );
});

/*
==============================
       Get User By ID
==============================
*/
export const getUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByPk(id, {
    attributes: { exclude: ["password"] },
    include: Role,
  });

  if (!user) return next(new ApiError("User not found", 404));

  const roles = user.Roles.map((role) => role.role_name);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: { ...user.toJSON(), roles } },
        "User fetched successfully"
      )
    );
});

const sendVerificationEmailToUser = async (user) => {
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Verify Your Email Address",
    text: `Please verify your email by clicking the following link: ${verificationUrl}`,
    html: `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 1 hour.</p>
    `,
  });

  console.log(`Verification email sent to ${user.email}`);
  return token;
};


/*
==============================
       Get All Users (Admin Only)
==============================
*/
export const getAllUsers = asyncHandler(async (req, res, next) => {
 
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] }, 
      include: {
        model: Role,
        attributes: ["role_name"],
        through: { attributes: [] }, 
      },
      order: [["id", "ASC"]], 
    });

    
    const formattedUsers = users.map((user) => {
      const userJSON = user.toJSON(); 
      userJSON.roles = userJSON.Roles.map((role) => role.role_name); // Create simple roles array
      delete userJSON.Roles; 
      return userJSON;
    });

  
    res.status(200).json(
      new ApiResponse(
        200,
        { users: formattedUsers },
        "All users retrieved successfully"
      )
    );
  } catch (error) {
 
    console.error("Error fetching all users:", error);
    return next(new ApiError("Failed to retrieve users", 500));
  }
});