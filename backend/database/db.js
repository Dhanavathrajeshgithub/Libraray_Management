import mongoose from "mongoose";

export const connectDB = () => {
  mongoose
    .connect(process.env.MONGODB_URI, {
      dbName: "MERN_LIBRARY_MANAGEMENT",
    })
    .then(() => {
      console.log("DB connected successfylly");
    })
    .catch((err) => {
      console.log("Error connecting DB", err);
    });
};
