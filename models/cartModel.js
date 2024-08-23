import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: [true, "Cart item must reference an item."],
  },
  quantity: {
    type: Number,
    required: [true, "Cart item must have a quantity."],
    min: [1, "Quantity must be at least 1."],
  },
  size: {
    type: String,
    required: true,
  },
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Cart must be associated with a user."],
  },
  items: [cartItemSchema],
  totalPrice: {
    type: Number,
    required: [true, "Cart must have a total price."],
    min: [0, "Total price cannot be negative."],
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

cartSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

cartSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
