import mongoose from "mongoose";
import crypto from "crypto";
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please enter username"],
      trim: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, "Please enter fullName"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please enter email"],
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["Admin", "User"],
      default: "User",
    },
    accountVerified: {
      type: Boolean,
      default: false,
    },
    borrowedBooks: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
        },
        returned: {
          type: Boolean,
          default: false,
        },
        borrowedDate: Date,
        dueDate: Date,
      },
    ],

    avatar: {
      type: String, // cloudinary url
      required: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    refreshTokenExpire: Date,
    verificationCode: Number,
    verificationCodeExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};
userSchema.methods.generateVerificationCode = function () {
  // generates random 5 digit number
  const verificationCode = crypto.randomInt(100000, 1000000);
  this.verificationCode = verificationCode;
  this.verificationCodeExpire = Date.now() + 15 * 60 * 1000;
  return verificationCode;
};
export const User = mongoose.model("User", userSchema);
