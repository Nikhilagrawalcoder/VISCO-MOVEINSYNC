const jwt = require('jsonwebtoken');
const {ApiError} = require('../utils/ApiError');
const Vendor = require('../models/Vendor.model');
const {asyncHandler} = require('../utils/asynchandler');



 const auth = asyncHandler(async (req, res, next) => {
    const token = req.cookies.accessToken;
    if(!token) throw new ApiError(401,"Invalid authorization")

    const decoded = jwt.verify(token, process.env.ACCESSTOKEN_KEY);

    if(!decoded) throw new ApiError(500,"Internal server error");

    // Find vendor and attach to request
    req.vendor = await Vendor.findOne({
        _id: decoded.id,
    });

    next();
})

module.exports={auth}