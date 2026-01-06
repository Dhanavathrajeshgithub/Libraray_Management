// const asyncHandler = (fn) => {
//   return async (req, res, next) => {
//     try {
//       await fn(req, res, next);
//     } catch (err) {
//       next(err); // forward to centralized error handler
//     }
//   };
// };

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next); // Fixed: .catch(next) passes actual error
};

export default asyncHandler;
