const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const Vendor = require('../models/Vendor.model.js');
const { asyncHandler } = require('../utils/asynchandler');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const generateAuthToken = (vendor) => {
  return jwt.sign(
    { id: vendor._id, role: vendor.role },
    process.env.ACCESSTOKEN_KEY,
    { expiresIn: '7d' }
  );
};

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new ApiError(400, "All fields are required");

  const vendor = await Vendor.findOne({ email });
  if (!vendor) throw new ApiError(401, "Invalid credentials");

  const checkPassword = await vendor.isPasswordCheck(password);
  if (!checkPassword) throw new ApiError(401, "Invalid credentials");

  const token = generateAuthToken(vendor);
  if (!token) throw new ApiError(500, "Error while generating accessToken");

  res.status(200)
    .cookie("accessToken", token, {
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax"
    })
    .json({
      success: true,
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        role: vendor.role
      },
      message: `Login successfully as ${vendor.role}`
    });
});

const logout = asyncHandler(async (req, res) => {
  const vendorId = req.vendor?._id;

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw new ApiError(404, "No vendor found");

  res.status(200)
    .clearCookie("accessToken", { 
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax"
    })
    .json({
      success: true,
      message: "Logged out successfully"
    });
});

module.exports = { login, logout, generateAuthToken };
