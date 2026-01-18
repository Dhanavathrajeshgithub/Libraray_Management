import cron from "node-cron";
import { sendEmail } from "../utils/sendEmail.js";
import { Borrow } from "../models/borrow.model.js";
import { User } from "../models/user.model.js";
export const notifyUser = () => {
  cron.schedule("*/30 * * * *", async () => {
    const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
    try {
      const borrowed = await Borrow.find({
        dueDate: { $lte: tomorrow },
        returnDate: null,
        notified: false,
      });
      for (const b of borrowed) {
        const user = await User.findById(b.userId);
        const email = user.email;
        sendEmail({
          email,
          subject: "Book return Remainder",
          message: `Hello Mr/Mrs ${user.fullName},\n\n This is a remainder that the book you borrowed with id ${b.bookId} is due for Tommorow. Please return BOOK  before due date else a fine of INR ${process.env.FINE_PER_DAY} will be fined per day.`,
        });
        b.notified = true;
        await b.save({ validateModifiedOnly: true });
      }
    } catch (error) {
      console.error("Cron job error:", error);
    }
  });
};
