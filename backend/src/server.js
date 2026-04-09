const env = require("./config/env");
const app = require("./app");
const { connectDb } = require("./config/db");

const startServer = async () => {
  try {
    await connectDb(env.mongodbUri);
    console.log("MongoDB connected");

    app.listen(env.port, () => {
      console.log(`Backend listening on port ${env.port}`);
    });
  } catch (error) {
    console.error("Fatal startup error", error);
    process.exit(1);
  }
};

startServer();

