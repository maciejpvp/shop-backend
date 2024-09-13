import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

import fs from "fs";
import mongoose from "mongoose";
// import Tour from '../../models/tourModel.js';
// import User from '../../models/userModel.js';
// import Review from '../../models/reviewModel.js';

const DB = process.env.DATABASE;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected");
  });

// const tours = JSON.parse(
//   fs.readFileSync(`./dev-data/data/tours.json`, 'utf-8')
// );
// const users = JSON.parse(
//   fs.readFileSync(`./dev-data/data/users.json`, 'utf-8')
// );
// const reviews = JSON.parse(
//   fs.readFileSync(`./dev-data/data/reviews.json`, 'utf-8')
// );
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews, { validateBeforeSave: false });
    console.log("Data loaded");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data deleted");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
} else {
  console.log("No argument provided!");
}
