import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User must have a name"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "User must have email address"],
    unique: true,
    validate: [validator.isEmail, "Please provide valid email address"],
  },
  emailVerifyCode: String,
  emailVerifyExpires: Date,
  role: {
    type: String,
    enum: ["user", "worker", "admin", "owner"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "User must have password"],
    minlength: [8, "Password must have minimum 8 characters"],
    select: false,
  },
  credentialsChangedAt: Date,
  image: {
    type: String,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: false,
    select: false,
  },
});

// userSchema.pre(/^find/, function (next) {
//   this.find({ active: { $ne: false } });
//   next();
// });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password email") || this.isNew) return next();
  this.credentialsChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.comparePasswords = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimeStamp < changedTimeStamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.createEmailVerificationCode = function () {
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  this.emailVerifyCode = crypto
    .createHash("sha256")
    .update(verificationCode)
    .digest("hex");

  this.emailVerifyExpires = Date.now() + 10 * 60 * 1000;

  return verificationCode;
};

userSchema.methods.verifyEmail = function (code) {
  const hashedCode = crypto.createHash("sha256").update(code).digest("hex");
  let isValid;

  isValid = this.emailVerifyCode === hashedCode;

  if (!isValid) return [isValid, "Email Verify Code Invalid", "004"];

  isValid = this.emailVerifyExpires > Date.now();

  if (!isValid) return [isValid, "Email Verify Code Expired", "003"];

  return [isValid, "Email Verified Succesfully", "002"];
};

const User = mongoose.model("User", userSchema);

export default User;
