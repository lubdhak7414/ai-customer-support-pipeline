const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("Missing or invalid authorization header", 401);
  }

  const token = header.split(" ")[1];
  const decoded = jwt.verify(token, env.jwtSecret);

  const user = await User.findById(decoded.sub).select("_id name email role");
  if (!user) {
    throw new AppError("User no longer exists", 401);
  }

  req.user = user;
  next();
});

const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("Forbidden", 403));
    }

    return next();
  };

module.exports = {
  protect,
  requireRole,
};
