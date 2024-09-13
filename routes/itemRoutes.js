import express from "express";

import * as Auth from "../controllers/authController.js";
import * as Item from "../controllers/itemController.js";

const router = express.Router();

router.use(Auth.protect);
router.route("/").get(Item.getAllItems);
router.route("/:id").get(Item.getItemById);

router.use(Auth.protect, Auth.restrictTo("admin", "owner"));
router.route("/").post(Item.uploadItemImages, Item.createItem);
router.route("/:id").patch(Item.updateItem).delete(Item.deleteItem);
router.route("/stock/:id").patch(Item.addStock);

export default router;
