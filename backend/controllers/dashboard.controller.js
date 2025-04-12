const {asyncHandler} = require('../utils/asynchandler');
const Vendor = require('../models/Vendor.model');
const Vehicle = require('../models/Vehicle.model');
const Driver = require('../models/Driver.model');
const {ApiError} = require('../utils/ApiError');

// --------- GET SUPER VENDOR DASHBOARD --------- //
const getDashboardData = asyncHandler(async (req, res) => {
  const superVendor = req.vendor;
 
  if (superVendor.role !== 'SUPER') {
    throw new ApiError(400, 'Access denied: Only Super Vendors can view this data.');
  }

  const result = await Vendor.aggregate([
    { $match: { _id: superVendor._id } },
    {
      $graphLookup: {
        from: 'vendors',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parent',
        as: 'descendants'
      }
    }
  ]);

  let descendantVendors = [];
  if(result.length>0){
    descendantVendors=result[0].descendants;
  }
  const vendorIds = [superVendor._id, ...descendantVendors.map(v => v._id)];

  const vehicles = await Vehicle.find({ vendor: { $in: vendorIds } });
  const drivers = await Driver.find({ vendor: { $in: vendorIds } });

  // Optimized counting
  let active = 0, inactive = 0, pending = 0;
  vehicles.forEach(vehicle => {
    if (vehicle.status === 'ACTIVE') active++;
    if (vehicle.status === 'INACTIVE') inactive++;
    if (vehicle.documents.some(doc => !doc.verified)) pending++;
  });

  const availableDrivers = drivers.reduce((count, d) =>
    d.status === 'AVAILABLE' ? count + 1 : count, 0
  );

  res.status(200).json({
    success: true,
    message: 'Fetched dashboard successfully',
    dashboard: {
      superVendor,
      allVendors: descendantVendors,
      fleetStatus: {
        activeVehiclesCount: active,
        inactiveVehiclesCount: inactive,
        pendingVerifications: pending
      },
      driverStatus: {
        availableDriversCount: availableDrivers
      }
    }
  });
});

// --------- OVERRIDE VEHICLE OPERATION --------- //
const overrideVehicleOperation = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  const superVendor = req.vendor;

  if (superVendor.role !== 'SUPER') {
    throw new ApiError(403, 'Access Denied');
  }

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new ApiError(404, 'Vehicle not found');
  }

  vehicle.status = 'INACTIVE';
  await vehicle.save();

  res.status(200).json({
    success: true,
    message: 'Vehicle operation overridden by Super Vendor'
  });
});

// --------- FORCE VERIFY VEHICLE DOCUMENTS --------- //
const forceVerifyVehicleDocuments = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  const superVendor = req.vendor;

  if (superVendor.role !== 'SUPER') {
    throw new ApiError(403, 'Access Denied');
  }

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new ApiError(404, 'Vehicle not found');
  }

  const documentsToVerify = vehicle.documents.filter(doc =>
    doc.fileUrl!="" && !doc.verified
  );

  if (documentsToVerify.length === 0) {
    throw new ApiError(400, 'All documents are already verified');
  }

  documentsToVerify.forEach(doc => {
    doc.verified = true;
    doc.verificationDate = new Date();
  });

  await vehicle.save();

  res.status(200).json({
    success: true,
    message: 'Documents verified successfully!',
    data: {
      verifiedDocuments: documentsToVerify.map(doc => doc.type)
    }
  });
});

// --------- FORCE VERIFY DRIVER LICENSE --------- //
const forceVerifyDriverLicense = asyncHandler(async (req, res) => {
  const { driverId } = req.params;
  const superVendor = req.vendor;

  if (superVendor.role !== 'SUPER') {
    throw new ApiError(403, 'Access Denied');
  }

  const driver = await Driver.findById(driverId);
  if (!driver) {
    throw new ApiError(404, 'Driver not found');
  }

  if (driver.license?.verified) {
    throw new ApiError(400, 'License already verified');
  }

  driver.license.verified = true;
  driver.license.verificationDate = new Date();
  driver.status = 'AVAILABLE';

  await driver.save();

  res.status(200).json({
    success: true,
    message: 'License verified successfully!'
  });
});

module.exports = {
  getDashboardData,
  overrideVehicleOperation,
  forceVerifyVehicleDocuments,
  forceVerifyDriverLicense
};
