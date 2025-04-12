const Vendor = require('../models/Vendor.model.js');
const {ApiError} = require('../utils/ApiError');
const {asyncHandler} = require('../utils/asynchandler');


 const createSuperVendor = asyncHandler(async (req, res) => {
    // Manual validation for first Super Vendor
    const exists = await Vendor.exists({ role: 'SUPER' });
    if (exists) throw new ApiError(400, 'Super vendor already exists');
  
    const superVendor = await Vendor.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: 'SUPER',
      parent: null // Explicitly no parent
    });
  
    res.status(201).json(
      {
        success:true,
        superVendor: {
          _id: superVendor._id,
          name: superVendor.name,
          email: superVendor.email,
          role: superVendor.role
        },
        message:"successfully created super vendor"
      }
    );
});

module.exports={createSuperVendor}