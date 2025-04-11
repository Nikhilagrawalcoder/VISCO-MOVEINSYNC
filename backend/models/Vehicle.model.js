const mongoose = require('mongoose');

// Enum constants
const VEHICLE_STATUSES = ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE'];
const DOCUMENT_TYPES = ['RC', 'PERMIT', 'POLLUTION'];
const FUEL_TYPES = ['PETROL', 'DIESEL', 'ELECTRIC', 'CNG'];

// Subschema for vehicle documents
const documentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: DOCUMENT_TYPES,
    required: true
  },
  documentNumber: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String,
    trim: true
  },
  expiryDate: {
    type: Date
  },
  verified: {
    type: Boolean,
    default: false
  },
  verificationDate: {
    type: Date
  }
}, { _id: false });

// Main vehicle schema
const vehicleSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  seatingCapacity: {
    type: Number,
    required: true,
    min: 1
  },
  fuelType: {
    type: String,
    enum: FUEL_TYPES,
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  documents: [documentSchema],
  status: {
    type: String,
    enum: VEHICLE_STATUSES,
    default: 'ACTIVE'
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  }
}, {
  timestamps: true
});

// Indexes for performance
vehicleSchema.index({ vendor: 1, status: 1 });
vehicleSchema.index({ registrationNumber: 1 }, { unique: true });

// Pre-save validation to ensure RC and POLLUTION are present
vehicleSchema.pre('save', function (next) {
  const requiredDocs = ['RC', 'POLLUTION'];
  const existingDocTypes = this.documents.map(doc => doc.type);
  const hasAllRequired = requiredDocs.every(doc => existingDocTypes.includes(doc));

  if (!hasAllRequired) {
    return next(new Error('Missing required documents: RC and/or POLLUTION'));
  }

  next();
});

// Optional virtual: Check if vehicle is compliant
vehicleSchema.virtual('isCompliant').get(function () {
  return this.documents.every(doc => doc.verified && (!doc.expiryDate || doc.expiryDate > Date.now()));
});

// Enable virtuals in JSON output
vehicleSchema.set('toJSON', { virtuals: true });
vehicleSchema.set('toObject', { virtuals: true });

// Export model
const Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports = Vehicle;
