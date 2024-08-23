import express from "express";

import * as Auth from "../controllers/authController.js";

const router = express.Router();

router.route("/signup").post(Auth.signup);
router.route("/verifyEmail").post(Auth.verifyEmail);
router.route("/login").post(Auth.login);
router.route("/resendVerifyEmailCode").post(Auth.reSendEmailVerifyCode);

router.route("/forgotPassword").post(Auth.forgotPassword);
router.route("/resetPassword").patch(Auth.resetPassword);

export default router;
