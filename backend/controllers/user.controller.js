import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateForgotPasswordEmailTemplate } from "../utils/emailTemplate.js";
import crypto from "crypto";

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
      maxAge: 2 * 24 * 60 * 1000,
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
      maxAge: 2 * 24 * 60 * 1000,
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

export const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(400, "user is not loggedin");
  }
  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .json(new ApiResponse(200, user, "User loggedout successfully"));
});

export const getUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "User not loggedin");
  }
  return res.json(new ApiResponse(200, req.user, "User fetched successfully"));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    email: req.body?.email,
    accountVerified: true,
  });
  if (!user) {
    throw new ApiError(400, "Provide email or Invalid email");
  }
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateModifiedOnly: true });
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  const message = generateForgotPasswordEmailTemplate(resetPasswordUrl);
  try {
    await sendEmail({
      email: user.email,
      subject: "Bookworm Library Management System Password Recovery",
      message,
    });
    res
      .status(200)
      .json(
        new ApiResponse(200, {}, `Email sent to  ${user.email} successfully`)
      );
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateModifiedOnly: true });
    throw new ApiError(500, `Failed to send email to  ${user.email}`);
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const resetPasswordToken = await crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    throw new ApiError(400, "invalid resetPasswordToken or has been expired");
  }
  if (!req?.body?.password || !req?.body?.confirmPassword) {
    throw new ApiError(400, "Password and confirm new password both required");
  }
  if (req?.body?.password !== req?.body?.confirmPassword) {
    throw new ApiError(400, "Password and confirm new password doesn't match");
  }
  if (req.body.password.length < 8 || req.body.password.length > 16) {
    throw new ApiError(
      400,
      "Password length must be between 8 and 16 inclusively"
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save({ validateModifiedOnly: true });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "User password changed successfully"));
});

export const updatePassword = asyncHandler(async (req, res) => {
  const user = req.user;
  const { oldPassword, newPassword } = req.body; // 'oldPassword' clearer than 'password'

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "oldPassword and newPassword required");
  }

  if (!user.isPasswordCorrect(oldPassword)) {
    throw new ApiError(401, "Incorrect current password"); // 401 better for auth failure
  }

  if (newPassword.length < 8 || newPassword.length > 16) {
    throw new ApiError(400, "New password must be 8-16 characters");
  }

  // Direct instance update → triggers bcrypt middleware
  user.password = newPassword;
  await user.save({ validateModifiedOnly: true });

  // Don't return full user (exposes other fields)
  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully"));
});
