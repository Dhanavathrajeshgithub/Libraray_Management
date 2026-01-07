import express from "express";
import { registerUser, verifyOtp } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = express.Router();

router.post("/register", upload.single("avatar"), registerUser);
router.post("/verify-otp", verifyOtp);
export default router;
