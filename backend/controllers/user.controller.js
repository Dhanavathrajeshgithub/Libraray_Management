import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password } = req.body;
  if (!username || !fullName || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }
  if (password.length < 8 || password.length > 16) {
    throw new ApiError(400, "password length between 8 & 16");
  }
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar filed is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar on cloudinary");
  }

  const user = await User.create({
    username,
    fullName,
    email,
    password,
    avatar: avatar?.url,
  }).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(500, "Failed to create user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Successfully registered user"));
});
