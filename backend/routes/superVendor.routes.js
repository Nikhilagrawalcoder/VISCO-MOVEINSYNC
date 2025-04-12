const express = require('express');
const router = express.Router();

const { auth } = require('../middlewares/auth.middleware');
const { checkPermissions } = require('../middlewares/accessControl.middleware');
const {
  forceVerifyDriverLicense,
  forceVerifyVehicleDocuments,
  getDashboardData,
  overrideVehicleOperation
} = require('../controllers/dashboard.controller');


router.use(auth)
router.use(checkPermissions('super:override'))

router.route('/dashboard').get(getDashboardData)
router.route('/override/vehicle/:vehicleId').patch(overrideVehicleOperation)
router.route('/override/vehicle-documents/:vehicleId').patch(forceVerifyVehicleDocuments)
router.route('/override/driver-documents/:driverId').patch(forceVerifyDriverLicense)

module.exports= router