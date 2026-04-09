const mongoose = require("mongoose");

const connectDb = async (mongodbUri) => {
  await mongoose.connect(mongodbUri, {
    serverSelectionTimeoutMS: 10000,
  });
};

module.exports = { connectDb };
