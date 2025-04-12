const Vendor = require("../models/Vendor.model");

class DelegationService {
  async delegatePermissions(superVendorId, subVendorId, permissions) {
    const superVendor = await Vendor.findById(superVendorId);
    const subVendor = await Vendor.findById(subVendorId);

    if (!superVendor || !subVendor) {
      throw new Error('SuperVendor and SubVendor both are required');
    }

    // Validate hierarchy
    if (!subVendor.parent.equals(superVendor._id)) {
      throw new Error('Sub-vendor not under Super Vendor');
    }

    // Add delegated permissions
    subVendor.delegatedPermissions = subVendor.delegatedPermissions.concat(
      permissions.map(permission => ({
        permission,
        delegatedBy: superVendorId
      }))
    );

    await subVendor.save();
    return subVendor;
  }

  async revokePermissions(superVendorId, subVendorId, permissions) {
    const superVendor = await Vendor.findById(superVendorId);
    const subVendor = await Vendor.findById(subVendorId);

    if (!subVendor) {
      throw new Error('SubVendor is required');
    }

    // Validate hierarchy
    if (!subVendor.parent.equals(superVendor._id)) {
      throw new Error('Sub-vendor not under Super Vendor');
    }

    // Revoke specific permissions
    subVendor.delegatedPermissions = subVendor.delegatedPermissions.filter(
      dp =>
        !permissions.includes(dp.permission) ||
        !dp.delegatedBy.equals(superVendorId)
    );

    await subVendor.save();
    return subVendor;
  }
}

// Export instance of the service
module.exports = new DelegationService();
