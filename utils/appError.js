import path from "path";
import { fileURLToPath } from "url";
import errorMessages from "./errorMessages.json" with { type: "json" };

// Potrzebne do określenia __dirname w ES6
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

export class AppError extends Error {
  constructor(code, statusCode) {
    const message = errorMessages[code] || "Something went wrong";
    super(message);
    this.statusCode = statusCode;

    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
