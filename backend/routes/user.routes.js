import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { isAuthorized, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllUsers,
  registerNewAdmin,
} from "../controllers/user.controller.js";
const router = express.Router();

router.get("/all", verifyJWT, isAuthorized("Admin"), getAllUsers);
router.post(
  "/register-admin",
  verifyJWT,
  isAuthorized("Admin"),
  upload.single("avatar"),
  registerNewAdmin,
);

export default router;
