const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Constants for roles and default permissions
const ROLES = ['SUPER', 'REGIONAL', 'CITY', 'LOCAL'];
const DEFAULT_PERMISSIONS = {
  SUPER: ['*'],
  REGIONAL: ['vehicle:create', 'driver:create'],
  CITY: ['vehicle:read', 'driver:read'],
  LOCAL: ['booking:manage']
};

// Vendor schema
const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ROLES,
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  permissions: [{
    type: String
  }],
  delegatedPermissions: [{
    permission: String,
    delegatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor'
    }
  }]
}, {
  timestamps: true // adds createdAt and updatedAt
});

//  Pre-save hook: Default permissions
vendorSchema.pre('save', function (next) {
  if (!this.permissions || this.permissions.length === 0) {
    this.permissions = this.getDefaultPermissions();
  }
  next();
});

//  Pre-save hook: SUPER vendor cannot have parent
vendorSchema.pre('save', function (next) {
  if (this.role === 'SUPER' && this.parent) {
    return next(new Error('SUPER vendor cannot have a parent'));
  }
  next();
});

//  Pre-save hook: Hash password
vendorSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

//  Instance method: Check password
vendorSchema.methods.isPasswordCheck = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//  Instance method: Get default permissions based on role
vendorSchema.methods.getDefaultPermissions = function () {
  return DEFAULT_PERMISSIONS[this.role] || [];
};

//  Instance method: Permission check
vendorSchema.methods.hasPermission = function (requiredPermission) {
  const delegated = this.delegatedPermissions.map(d => d.permission);
  return (
    this.permissions.includes('*') ||
    this.permissions.includes(requiredPermission) ||
    delegated.includes(requiredPermission)
  );
};

// Export the model
const Vendor = mongoose.model('Vendor', vendorSchema);
module.exports = Vendor;
