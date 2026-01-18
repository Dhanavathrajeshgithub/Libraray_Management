import mongoose from "mongoose";

export const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "MERN_LIBRARY_MANAGEMENT2",
    })
    .then(() => {
      console.log("DB connected successfylly");
    })
    .catch((err) => {
      console.log("Error connecting DB", err);
    });
};
