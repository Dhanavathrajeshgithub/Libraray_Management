export const calculateFine = (dueDate) => {
  const today = Date.now();
  let fine = 0;
  if (today > dueDate) {
    const diffTime = today - dueDate; // milliseconds
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // days
    fine = process.env.FINE_PER_DAY * diffDays;
  }
  return fine;
};
