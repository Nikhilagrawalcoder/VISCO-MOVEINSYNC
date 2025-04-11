const mongoose = require('mongoose');

// Constants for enums
const DRIVER_STATUS = ['AVAILABLE', 'ON_TRIP', 'INACTIVE'];
const DOCUMENT_TYPES = ['AADHAAR', 'PAN', 'MEDICAL_CERTIFICATE'];

// Subschema for driver documents
const documentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: DOCUMENT_TYPES,
    required: true
  },
  documentNumber: {
    type: String,
    required: true,
    trim: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (v) {
        return v > Date.now();
      },
      message: 'Document expiry date must be in the future.'
    }
  }
}, { _id: false });

// Subschema for license
const licenseSchema = new mongoose.Schema({
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Main Driver schema
const driverSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  contactNumber: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    trim: true,
    required:true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  license: licenseSchema,
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  status: {
    type: String,
    enum: DRIVER_STATUS,
    default: 'AVAILABLE'
  },
  documents: [documentSchema]
}, {
  timestamps: true
});

// Instance method to check license validity
driverSchema.methods.isLicenseValid = function () {
  return this.license.expiryDate > Date.now() && this.license.verified;
};

// Pre-save hook to deactivate if license is invalid
driverSchema.pre('save', function (next) {
  if (!this.isLicenseValid()) {
    this.status = 'INACTIVE';
  }
  next();
});

// Virtual for quick access to license number
driverSchema.virtual('licenseNumber').get(function () {
  return this.license?.licenseNumber;
});

// Export model
const Driver = mongoose.model('Driver', driverSchema);
module.exports = Driver;
