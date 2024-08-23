const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: [true, "Review must be associated with item"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Review must be associated with User"],
  },
  rating: {
    type: Number,
    required: [true, "Review must have rating"],
    validate: {
      validator: function (value) {
        return value % 0.5 === 0;
      },
      message: (props) =>
        `${props.value} is not a valid rating! Rating should be in increments of 0.5.`,
    },
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
