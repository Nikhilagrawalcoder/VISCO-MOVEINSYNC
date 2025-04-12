const  Vendor  =require( "../models/Vendor.model.js"); 

class VendorHierarchy {
  constructor() {
    this.roleHierarchy = {
      'SUPER': ['REGIONAL'],
      'REGIONAL': ['CITY'],
      'CITY': ['LOCAL'],
      'LOCAL': []
    };
  }

  async createSubVendor(parentId, vendorData) {
    const parent = await Vendor.findById(parentId);
    if (!parent) throw new Error('Parent vendor not found');
    
    // Hierarchy validation
    if (!this.roleHierarchy[parent.role].includes(vendorData.role)) {
      throw new Error(`Invalid hierarchy: ${parent.role} cannot create ${vendorData.role}`);
    }

    // Depth validation
    const depth = await this.getHierarchyDepth(parentId);
    if (depth >= 4) throw new Error('Maximum hierarchy depth reached');

  

    const vendor = new Vendor({
      ...vendorData,
      parent: parentId,
    });

    return await vendor.save();
  }

  async getHierarchyDepth(vendorId) {
    let depth = 0;
    let current = await Vendor.findById(vendorId);
    
    while (current.parent) {
      depth++;
      current = await Vendor.findById(current.parent);
    }
    
    return depth;
  }

}

module.exports = new VendorHierarchy();
