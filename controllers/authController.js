import User from "../models/userModel.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import {
  sendEmailVerifyCodeMail,
  sendPasswordResetToken,
} from "../utils/email.js";
import crypto from "crypto";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const signup = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
  });
  const verifyCode = newUser.createEmailVerificationCode();
  sendEmailVerifyCodeMail(verifyCode, newUser.email);
  newUser.save();
  res.status(201).json({
    status: "success",
    code: "001",
    message: "User Created",
  });
});

export const verifyEmail = catchAsync(async (req, res, next) => {
  const { email, code } = req.body;
  console.log({ email }, { code });
  const user = await User.findOne({ email }).select("+active");
  if (user.active) return next(new AppError("009", 400));
  const [isValid, message, errorCode] = user.verifyEmail(code);
  if (!isValid) {
    if (errorCode === "003") {
      sendEmail(user);
    }
    return next(new AppError(errorCode, 400));
  }
  user.emailVerifyCode = undefined;
  user.emailVerifyExpires = undefined;
  user.active = true;
  await user.save();
  res.status(200).json({
    status: "success",
    code: errorCode,
    message,
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select(
    "password active name email"
  );
  if (!user || !(await user.comparePasswords(password, user.password))) {
    return next(new AppError("006", 401));
  }
  if (!user.active) {
    await sendEmail(user, user.email.emailVerifyExpires, "email");
    return next(new AppError("007", 401));
  }

  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: false, //true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = false; //true

  res.cookie("jwt", token, cookieOptions);

  console.log(user);

  res.status(200).json({
    status: "success",
    code: "005",
    message: "Login successful",
    data: {
      token,
      user: {
        name: user.name,
        email: user.email,
      },
    },
  });
});

export const reSendEmailVerifyCode = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const user = await User.findOne({ email }).select("+active");
  console.log(user);
  if (user && !user.active) {
    await sendEmail(user, user.email.emailVerifyExpires, "email");
  }
  return res.status(200).json({
    status: "success",
    code: "008",
    message: "Email Verify Code Sent",
  });
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const user = await User.findOne({ email });
  sendEmail(user, user.passwordResetExpires, "password");
  res.status(200).json({
    status: "success",
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const hashToken = crypto
    .createHash("sha256")
    .update(req.body.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) return next(new AppError("010", 400));
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.status(200).json({
    status: "success",
    code: "011",
    message: "Password Succesfully Reseted",
  });
});

const sendEmail = catchAsync(async (user, expires, type) => {
  // const now = Date.now() + 9 * 60 * 1000;
  // if (expires > now) {
  //   console.log("Email timeout");
  //   return false;
  // }
  if (type === "email") {
    const verifyCode = user.createEmailVerificationCode();
    await user.save();
    sendEmailVerifyCodeMail(verifyCode, user.email);
  } else {
    const resetToken = user.createPasswordResetToken();
    await user.save();
    sendPasswordResetToken(resetToken, user.email);
  }
});

export const protect = catchAsync(async (req, res, next) => {
  console.log(!!req.headers["authorization"]);
  console.log(!!req.cookies.jwt);
  if (!req.headers["authorization"] && !req.cookies.jwt)
    return next(new AppError("013", 401));
  const token = req.cookies.jwt || req.headers["authorization"].split(" ")[1];
  console.log(token);

  if (!token) return next(new AppError("013", 401));

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);
  if (!user && user.changedPasswordAfter(decoded.iat))
    return next(new AppError("013", 401));

  req.user = user;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return next(new AppError("012", 403));
    next();
  };
};
