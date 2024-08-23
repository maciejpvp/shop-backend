import Item from "../models/itemModel.js";
import { AppError } from "../utils/appError.js";
import { APIFeatures } from "../utils/apiFeatures.js";
import { catchAsync } from "../utils/catchAsync.js";
import multer from "multer";
import sharp from "sharp";

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("998"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadItemImages = upload.array("images", 5);

export const getAllItems = catchAsync(async (req, res, next) => {
  console.log(req.query);
  const features = new APIFeatures(Item.find({}), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const items = await features.query;

  items.forEach((item) => {
    item.stock = undefined;
  });

  res.status(200).json({
    status: "success",
    results: items.length,
    data: {
      items,
    },
  });
});

export const getItemById = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const item = await Item.findById(id);
  if (!item) {
    return next(new AppError("014", 404));
  }

  console.log(item);

  res.status(200).json({
    status: "success",
    code: "017",
    message: "Data Received",
    data: {
      item: {
        name: item.name,
        description: item.description,
        price: item.price,
        stock: {
          S: item.stock.get("S") > 0 ? "Available" : "Not Available",
          M: item.stock.get("M") > 0 ? "Available" : "Not Available",
          L: item.stock.get("L") > 0 ? "Available" : "Not Available",
          XL: item.stock.get("XL") > 0 ? "Available" : "Not Available",
        },
      },
    },
  });
});

export const createItem = catchAsync(async (req, res, next) => {
  const { name, description, price, category, size, stock } = req.body;
  const newItem = await Item.create({
    name,
    description,
    price,
    category,
    size,
    stock,
  });
  const itemId = newItem._id;

  if (req.files && req.files.length > 0) {
    const images = [];

    await Promise.all(
      req.files.map(async (file, index) => {
        const timestamp = Date.now();
        const imageFileName = `item-${itemId}-${timestamp}-${index + 1}.jpg`;

        await sharp(file.buffer)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`images/items/${imageFileName}`);

        images.push(imageFileName);
      })
    );

    newItem.images = images;
    await newItem.save();
  }

  res.status(201).json({
    status: "success",
    code: "016",
    message: "Item Created",
  });
});
export const addStock = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const { stock, size } = req.body;

  const item = await Item.findById(id);
  if (!item) {
    return next(new AppError("014", 404));
  }
  const currValue = item.stock.get(size);
  const newValue = currValue + stock;
  item.stock.set(size, newValue);

  await item.save();
  res.status(200).json({
    status: "success",
    code: "015",
    message: "Item Updated",
  });
});
export const deleteItem = catchAsync(async (req, res, next) => {
  await Item.findOneAndDelete(req.params.id);
  res.status(204).json({});
});
export const updateItem = catchAsync(async (req, res, next) => {});
