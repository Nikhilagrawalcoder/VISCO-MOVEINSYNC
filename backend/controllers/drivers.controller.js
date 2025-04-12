const {asyncHandler} = require('../utils/asynchandler');
const Driver = require('../models/Driver.model.js');
const {ApiError} = require('../utils/ApiError');
const {uploadOnCloudinary} = require('../utils/cloudinary');
const Vehicle = require('../models/Vehicle.model.js');


// ---------DRIVER ONBOARDING-------- //

 const createDriver = asyncHandler(async (req, res) => {
  const {
    fullName,
    contactNumber,
    email,
    licenseNumber,
    licenseExpiry,
    aadhaarNumber,
    panNumber,
    aadhaarExpiry,
    panExpiry,
    medicalNumber,
    medicalExpiry
  } = req.body;

  // Validate required fields for driver creation
  if (!fullName || !contactNumber || !licenseNumber || !licenseExpiry) {
    throw new ApiError(400, "All required fields for driver details must be provided");
  }

  // Extract file paths for documents from req.files
  const aadhaarLocalPath = req.files?.aadhaar?.[0]?.path;
  const panLocalPath = req.files?.pan?.[0]?.path;
  const medicalLocalPath = req.files?.medical?.[0]?.path;

  // Ensure at least one mandatory document (Aadhaar or PAN) is provided
  if (!aadhaarLocalPath && !panLocalPath) {
    throw new ApiError(400, "Either Aadhaar or PAN document is required");
  }

  const documents = [];

  // Upload Aadhaar document (if provided)
  if (aadhaarLocalPath) {
    const aadhaarUpload = await uploadOnCloudinary(aadhaarLocalPath);
    if (!aadhaarUpload) throw new ApiError(500, "Failed to upload Aadhaar document");
    documents.push({
      type: 'AADHAAR',
      documentNumber: aadhaarNumber,
      fileUrl: aadhaarUpload?.url,
      expiryDate: aadhaarExpiry
    });
  }

  // Upload PAN document (if provided)
  if (panLocalPath) {
    const panUpload = await uploadOnCloudinary(panLocalPath);
    if (!panUpload) throw new ApiError(500, "Failed to upload PAN document");
    documents.push({
      type: 'PAN',
      documentNumber: panNumber,
      fileUrl: panUpload?.url,
      expiryDate: panExpiry
    });
  }

  // Upload Medical Certificate (optional)
  if (medicalLocalPath) {
    const medicalUpload = await uploadOnCloudinary(medicalLocalPath);
    if (!medicalUpload) throw new ApiError(500, "Failed to upload Medical Certificate");
    documents.push({
      type: 'MEDICAL_CERTIFICATE',
      documentNumber: medicalNumber,
      fileUrl: medicalUpload?.url,
      expiryDate: medicalExpiry
    });
  }

  const driver = await Driver.create({
    fullName,
    contactNumber,
    email,
    license: {
      licenseNumber,
      expiryDate: licenseExpiry
    },
    vendor: req.vendor._id,
    documents
  });

  res.status(201)
  .json({
    success:true,
    driver:{
      fullName,
      contactNumber,
      email,
      licenseNumber,
      licenseExpiry
    },
    message:"Driver created successfully"
  })
});


// Assign to driver to vehicle

 const assignVehicleToDriver = asyncHandler(async (req, res) => {
    const { driverId, vehicleId } = req.body;
  
    // Validate input
    if (!driverId || !vehicleId) {
      throw new ApiError(400, 'Driver ID and Vehicle ID required');
    }
  
    // Get driver and vehicle
    const driver = await Driver.findOne({
      _id: driverId,
      vendor: req.vendor._id
    })
    
    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      vendor: req.vendor._id
    })
  
    if (!driver || !vehicle) {
      throw new ApiError(404, 'Driver or Vehicle not found');
    }
  
    // Check vehicle availability
    if (vehicle.assignedDriver && !vehicle.assignedDriver.equals(driverId)) {
      throw new ApiError(400, 'Vehicle already assigned to another driver');
    }
  
    // Update assignments
    driver.assignedVehicle = vehicleId;
    vehicle.assignedDriver = driverId;
  
    await Promise.all([driver.save(), vehicle.save()]);
  
    res.status(200).json({
      success: true,
      message: 'Assignment successful',
      driver: driver.assignedVehicle,
      vehicle: vehicle.assignedDriver
    });
  });

  module.exports={assignVehicleToDriver,createDriver}