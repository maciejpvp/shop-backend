import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, "Item must have a name"],
    maxlength: 200,
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Item must have description"],
    maxlength: 1000,
  },
  price: {
    type: Number,
    required: [true, "Item must have price"],
    min: 0,
  },
  category: {
    type: [String],
    required: [true, "Please specify minimum one category"],
  },
  stock: {
    type: Map,
    of: Number,
    default: {
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
    },
  },
  images: {
    type: [String],
  },
});

const Item = mongoose.model("Item", itemSchema);

export default Item;
