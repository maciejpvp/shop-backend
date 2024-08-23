import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

import mongoose from "mongoose";

const DB = process.env.DATABASE;

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(`Error name: ${err.name}`);
  console.error(`Error message: ${err.message}`);
  console.error(`Stack trace: ${err.stack}`);
  process.exit(1);
});

mongoose
  .connect(DB)
  .then(() => {
    console.log("Database connected");
  })
  .catch(() => {
    console.log("Failed to connect to DB");
  });

import app from "./app.js";

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION!");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
