import multer from "multer";
import os from "os"; // 1. Import Node's built-in OS module

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 2. Change destination to the system's temporary directory
    cb(null, os.tmpdir());
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage });
