const AppError = require("../utils/AppError");

const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    console.error("Unhandled server error", err);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    details: err.details || null,
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
