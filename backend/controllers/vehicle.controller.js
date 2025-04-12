const {asyncHandler} = require('../utils/asynchandler');
const Vehicle = require('../models/Vehicle.model.js');
const {ApiError} = require('../utils/ApiError');
const {uploadOnCloudinary} = require('../utils/cloudinary');


// ---------VEHICLE ONBOARDING-------- //

 const createVehicle = asyncHandler(async (req, res) => {
    const { registrationNumber, model, seatingCapacity,rcNumber, rcExpiry,pollutionNumber,pollutionExpiry} = req.body;
  const fuelType = req.body.fuelType.trim();  
    const rcLocalPath=req.files?.rc?.[0]?.path
    const pollutionLocalPath=req.files?.pollution?.[0]?.path

    let permitLocalPath
    if(req.files && Array.isArray(req.files.permit) && req.files.permit.length>0){
        permitLocalPath=req.files.permit[0].path
    } 
 
    if(!rcLocalPath || !pollutionLocalPath)
        throw new ApiError(400, 'RC and Pollution Certificate are required')

    const rc=await uploadOnCloudinary(rcLocalPath)
    const pollution=await uploadOnCloudinary(pollutionLocalPath)
    const permit=await uploadOnCloudinary(permitLocalPath)
  
    // Create vehicle
    const vehicle = await Vehicle.create({
      registrationNumber,
      model,
      seatingCapacity,
      fuelType,
      vendor: req.vendor._id,
      documents: [
        {
          type: 'RC',
          documentNumber: rcNumber,
          expiryDate: rcExpiry,
          fileUrl: rc?.url || ""
        },
        {
          type: 'POLLUTION',
          documentNumber: pollutionNumber,
          expiryDate: pollutionExpiry,
          fileUrl: pollution?.url||""
        },
        
      ]
    });
  
    if (req.files['permit']) {
      vehicle.documents.push({
          type: 'PERMIT',
          documentNumber: req.body.permitNumber,
          expiryDate: req.body.permitExpiry,
          fileUrl: permit?.url || ""
      });
      await vehicle.save();
    }
  
    res.status(201)
    .json({
      success:true,
      vehicle:{
        registrationNumber,
        model,
        seatingCapacity,
        fuelType,
        rc:rc.url,
        rcNumber,
        rcExpiry,
        pollution:pollution.url,
        pollutionNumber,
        pollutionExpiry
      },
      message:"Vehicle created successfully"
    })
  });

  module.exports={createVehicle};