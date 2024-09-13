import { AppError } from "./../utils/appError.js";

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  console.log(message);
  return new AppError("998", 400);
};

const handleDuplicateFiledDB = (err) => {
  // const message = `Duplicate field value: "${err.keyValue.name}". Please use another value!`;
  const dupKey = Object.keys(err.keyValue)[0];
  return new AppError(`019-${dupKey}`, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.properties.path);
  // const message = `Invalid input data: ${errors.join(". ")}`;
  console.log(errors.map((err) => err));
  return new AppError(`018-${errors}`, 400);
};

const handleJWTError = () => new AppError("010", 401);

const handleJWTTokenExpired = () => new AppError("010", 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    err: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      code: err.code,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      code: "999",
      message: "Something went wrong",
    });
  }
};

export const ErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err, message: err.message };
    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFiledDB(error);
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTTokenExpired();

    sendErrorProd(error, res);
  }
};
