import express from "express";

import * as Cart from "../controllers/cartController.js";
import * as Auth from "../controllers/authController.js";

const router = express.Router();

router.use(Auth.protect);

router.route("/").get(Cart.getCart);

router.route("/:id").post(Cart.addToCart).delete(Cart.deleteFromCart);

router.route("/inc/:id").get(Cart.incQuantity);
router.route("/dec/:id").get(Cart.decQuantity);

export default router;
