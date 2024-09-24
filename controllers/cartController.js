import { AppError } from "../utils/appError.js";
import Item from "../models/itemModel.js";
import Cart from "../models/cartModel.js";
import { catchAsync } from "../utils/catchAsync.js";

export const getCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.item",
    select: "name price images",
  });
  res.status(200).json({
    status: "success",
    code: "017",
    message: "Data Received",
    data: {
      cart,
    },
  });
});
export const addToCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const itemId = req.params.id;
  const { quantity, size } = req.body;

  if (!userId || !itemId || !quantity || !size) {
    return next(new AppError("998", 400));
  }

  const item = await Item.findById(itemId);
  if (!item) {
    return res.status(404).json({ message: "Item not found." });
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [], totalPrice: 0 });
  }

  const existingCartItem = cart.items.find(
    (cartItem) => cartItem.item.toString() === itemId && cartItem.size === size
  );

  if (existingCartItem) {
    existingCartItem.quantity += quantity;
  } else {
    cart.items.push({ item: itemId, quantity, size });
  }

  await cart.save();

  res.status(200).json(cart);
});

export const incQuantity = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const itemId = req.params.id;
  if (!itemId || !userId) {
    return next(new AppError("998", 400));
  }
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return next(new AppError("998", 400));
  }
  const item = cart.items.find((el) => el._id.equals(itemId));

  console.log(item);
  item.quantity++;
  // cart.totalPrice = cart.items.reduce((total, cartItem) => {
  //   return total + cartItem.quantity * item.price;
  // }, 0);
  await cart.save();

  res.status(200).json({
    status: "success",
    code: "015",
    message: "Item Updated",
  });
});

export const decQuantity = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const itemId = req.params.id;
  if (!itemId || !userId) {
    return next(new AppError("998", 400));
  }
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return next(new AppError("998", 400));
  }
  const item = cart.items.find((el) => el._id.equals(itemId));

  item.quantity--;
  await cart.save();

  res.status(200).json({
    status: "success",
    code: "015",
    message: "Item Updated",
  });
});

export const deleteFromCart = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new AppError("998", 400));
  }

  if (!cart.items.find((el) => el._id.equals(id))) {
    return next(new AppError("014", 404));
  }

  cart.items = cart.items.filter((el) => !el._id.equals(id));
  await cart.save();

  res.status(204).json({});
});
