import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
};

export const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password } = req?.body;
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
  user.verificationCode = verificationCode;
  user.verificationCodeExpire = Date.now() + 15 * 60 * 1000;
  await user.save({ validateModifiedOnly: true });

  const emailResult = await sendVerificationCode(verificationCode, email); // Await and no res
  if (!emailResult.success) {
    throw new ApiError(500, emailResult.message); // Let asyncHandler send error response
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { userId: user._id, username: user.username },
        "User registered successfully. Check email for verification."
      )
    );
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req?.body;
  if (!email || !otp) {
    throw new ApiError(400, "Email and Otp both are required.");
  }
  const userAllEntries = await User.find({
    email,
    accountVerified: false,
  }).sort({ createdAt: -1 });

  if (userAllEntries.length == 0) {
    throw new ApiError(
      404,
      "User doesn't exists with this email or already verified"
    );
  }

  // check for otp match
  const currUser = userAllEntries[0];
  if (currUser.verificationCode !== Number(otp)) {
    throw new ApiError(400, "Otp doesn't matched");
  }

  if (currUser.verificationCodeExpire < Date.now()) {
    throw new ApiError(400, "Otp expired");
  }
  // otp matched,
  currUser.accountVerified = true;
  currUser.verificationCode = null;
  currUser.verificationCodeExpire = null;
  await currUser.save({ validateModifiedOnly: true });

  // delete remaining users
  await User.deleteMany({ email, accountVerified: false });

  const accessToken = await currUser.generateAccessToken();
  if (!accessToken) {
    throw new ApiError(500, "Failed to generate access token");
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .json(new ApiResponse(200, currUser, "Account verified successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  if (!(email || username) || !password) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findOne({
    $or: [{ email }, { username }],
    accountVerified: true,
  }).select("+password");

  if (!user) {
    throw new ApiError(400, "User doesn't exists with this username or email");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect password");
  }
  const accessToken = await user.generateAccessToken();
  if (!accessToken) {
    throw new ApiError(500, "Failed to generate access token");
  }
  // password matched
  res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .json(
      new ApiResponse(
        200,
        {
          _id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          avatar: user.avatar,
          role: user.role,
        },
        "User logged in successfully"
      )
    );
});
