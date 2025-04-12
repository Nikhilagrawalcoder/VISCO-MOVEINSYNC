const  Vendor  =require("../models/Vendor.model.js");
const { ApiError } =require( "../utils/ApiError.js");

const checkPermissions = (requiredPermission) => {
    return async (req, res, next) => {
      try {
        const vendor = await Vendor.findById(req.vendor.id)
          .select('+permissions +delegatedPermissions');
        
        if(!vendor) next(new ApiError(404,"Vendor not found"))

        const hasAccess = vendor.permissions.includes('*') ||
        vendor.permissions.includes(requiredPermission) ||
        vendor.delegatedPermissions.some(dp => 
          dp.permission === requiredPermission
        );
  
        if (!hasAccess) {
          return next(new ApiError(403, `Insufficient permissions | ${requiredPermission} permission is required`));
        }
  
        next();
      } catch (err) {
        next(new ApiError(500, 'Permission check failed'));
      }
    };
};
  
module.exports= {checkPermissions};