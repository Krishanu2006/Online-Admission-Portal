const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/mysql/User");
const { getPasswordStatus } = require("./password.service");

const normalizeRole = (role) =>
  typeof role === "string" ? role.trim().toUpperCase() : "";

const registerStudent = async ({
  fname,
  lname,
  email,
  mobile,
  password,
}) => {
  if (!fname || !lname || !email || !mobile || !password) {
    throw new Error("All required fields must be provided.");
  }

  if (typeof password !== "string" || password.length < 12) {
    throw new Error("Password must be at least 12 characters long.");
  }

  const existingEmail = await User.findByEmail(email.trim());

  if (existingEmail) {
    throw new Error("Email is already registered.");
  }

  const existingMobile = await User.findByMobile(mobile.trim());

  if (existingMobile) {
    throw new Error("Mobile number is already registered.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    fname: fname.trim(),
    lname: lname.trim(),
    email: email.trim().toLowerCase(),
    mobile: mobile.trim(),
    passwordHash,
    role: "STUDENT",
  });

  return {
    id: user.id,
    user_id: user.user_id,
    fname: user.fname,
    lname: user.lname,
    email: user.email,
    mobile: user.mobile,
    role: normalizeRole(user.role),
  };
};

const createLoginResponse = async (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  const role = normalizeRole(user.role);

  if (!["STUDENT", "ADMIN"].includes(role)) {
    throw new Error("The account has an invalid role.");
  }

  const passwordStatus = await getPasswordStatus(user.id);

  const token = jwt.sign(
    {
      userId: user.id,
      role,
      mustChangePassword: passwordStatus.mustChangePassword,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );

  return {
    token,
    mustChangePassword: passwordStatus.mustChangePassword,
    user: {
      id: user.id,
      user_id: user.user_id,
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      mobile: user.mobile || user.phone_number,
      role,
    },
  };
};

const login = async ({ email, password }) => {
  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    throw new Error("Email and password are required.");
  }

  const user = await User.findByEmail(email.trim().toLowerCase());

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new Error("Invalid email or password.");
  }

  if (!user.is_active) {
    throw new Error("Account is inactive.");
  }

  if (normalizeRole(user.role) !== "STUDENT") {
    throw new Error("Student access required.");
  }

  return createLoginResponse(user);
};

const loginAdmin = async ({ email, password }) => {
  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    throw new Error("Email and password are required.");
  }

  const user = await User.findByEmail(email.trim().toLowerCase());

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new Error("Invalid email or password.");
  }

  if (!user.is_active) {
    throw new Error("Account is inactive.");
  }

  if (normalizeRole(user.role) !== "ADMIN") {
    throw new Error("Admin access required.");
  }

  return createLoginResponse(user);
};

module.exports = {
  registerStudent,
  login,
  loginAdmin,
};