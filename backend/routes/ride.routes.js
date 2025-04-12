// routes/rideRoutes.js
const express = require('express');
const { createVehicle } = require('../controllers/vehicle.controller');
const { assignVehicleToDriver, createDriver } = require('../controllers/drivers.controller');
const { auth } = require('../middlewares/auth.middleware');
const { checkPermissions } = require('../middlewares/accessControl.middleware');
const { upload } = require('../middlewares/multer.middleware');


const router = express.Router();

router.use(auth);
router.use(checkPermissions('ride:manage'));

// Vehicle routes
router.route('/vehicles').post(
    upload.fields([
        { name: 'rc', maxCount: 1 },
        { name: 'pollution', maxCount: 1 },
        { name: 'permit', maxCount: 1 }
      ]),
    createVehicle
)

// Driver routes
router.route('/drivers').post(
    upload.fields([
        { name: 'aadhaar', maxCount: 1 },
        { name: 'pan', maxCount: 1 },
        { name: 'medical', maxCount: 1 }
      ]),
    createDriver
)

router.route('/assign-driver').post(assignVehicleToDriver)

module.exports= router;