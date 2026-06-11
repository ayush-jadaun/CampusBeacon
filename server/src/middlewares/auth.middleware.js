import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

/*
=======================================================================
        Auth Middleware for checking and storing user auth info
=======================================================================
*/
export const authMiddleware = asyncHandler(async (req, res, next) => {
  // Web clients send the httpOnly cookie; mobile clients send a Bearer header
  const authHeader = req.headers.authorization;
  const token =
    req.cookies.token ||
    (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);

  if (!token) {
    // For /current endpoint, return a specific response
    if (req.path === "/api/users/current") {
      return res.status(200).json({
        status: "success",
        code: 200,
        data: { user: null },
        message: "No active session"
      });
    }
    throw new ApiError("Not authenticated. Please log in.", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // For /current endpoint, handle expired/invalid tokens gracefully
    if (req.path === "/api/users/current") {
      res.clearCookie("token");
      return res.status(200).json({
        status: "success",
        code: 200,
        data: { user: null },
        message: "Session expired"
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.clearCookie("token");
      throw new ApiError("Session expired. Please log in again.", 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.clearCookie("token");
      throw new ApiError("Invalid token. Please log in again.", 401);
    }
    throw new ApiError("Authentication failed. Please log in again.", 401);
  }
});

export default authMiddleware;
