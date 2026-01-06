import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
export const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password } = req.body;
  if (!username || !fullName || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }
  const existenceUser = await User.findOne({
    $or: [{ username }, { email }],
    accountVerified: true,
  });
  if (existenceUser) {
    throw new ApiError(400, "User already exists with above username or email");
  }
  const registrationAttemptsByUser = await User.find({
    $or: [{ username }, { email }],
    accountVerified: false,
  });
  if (registrationAttemptsByUser?.length >= 5) {
    throw new ApiError(
      400,
      "You have exceeded the number of registration attempts. Please try again after few minutes"
    );
  }
  if (password.length < 8 || password.length > 16) {
    throw new ApiError(400, "password length between 8 & 16");
  }
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar field is required");
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
  });

  const verificationCode = await user.generateVerificationCode();
  await user.save();
  sendVerificationCode(verificationCode, email, res);
  const registeredUser = await User.findById(user?._id).select(
    "-password -refreshToken"
  );
  if (!registeredUser) {
    throw new ApiError(500, "Failed to create user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, registeredUser, "Successfully registered user"));
});
