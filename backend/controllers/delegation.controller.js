const DelegationService =require( '../services/delegation.js');
const {asyncHandler} =require( '../utils/asynchandler.js');
const {ApiError} =require( '../utils/ApiError.js');

 const delegate = asyncHandler(async (req,res)=>{
    const { subVendorId, permissions } = req.body;

    if(!subVendorId || !permissions) throw new ApiError(400,"All fields are required")

    const superVendorId = req.vendor._id;

    const subVendor = await DelegationService.delegatePermissions(
      superVendorId,
      subVendorId,
      permissions
    );

    if(!subVendor) throw new ApiError(500,"Internal server error")

    res.status(200)
    .json({
      success:true,
      permissions,
      message:"delegated permmissions successfully"
    });
})

 const revoke = asyncHandler(async(req,res)=>{
    const { subVendorId, permissions } = req.body;

    if(!subVendorId || !permissions) throw new ApiError(400,"All fields are required")

    const superVendorId = req.vendor._id;

    const subVendor = await DelegationService.revokePermissions(
      superVendorId,
      subVendorId,
      permissions
    );

    if(!subVendor) throw new ApiError(500,"Internal server error")

    res.status(200).
    json({
      success:true,
      revokedPermissions:permissions,
      message:"revoked permissions successfully"
    });
})

module.exports={revoke,delegate};