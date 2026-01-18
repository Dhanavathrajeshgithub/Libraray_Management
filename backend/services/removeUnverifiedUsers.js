import cron from "node-cron";
import { User } from "../models/user.model.js";

export const removeUnverifiedUser = () => {
  cron.schedule("*/10 * * * *", async () => {
    try {
      const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
      await User.deleteMany({
        accountVerified: false,
        createdAt: { $lte: thirtyMinutesAgo },
      });
    } catch (error) {
      console.log("Error while deleting unverified users");
    }
  });
};
