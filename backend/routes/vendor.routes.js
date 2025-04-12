const express = require('express');
const vendorRouter = express.Router();

const { createVendor } = require('../controllers/vendor.controller');
const { auth } = require('../middlewares/auth.middleware');
const { login, logout } = require('../controllers/auth.controller');
const { checkPermissions } = require('../middlewares/accessControl.middleware');
 

vendorRouter.route('/login').post(login)

vendorRouter.use(auth)
vendorRouter.route('/create-vendor').post(checkPermissions("vendor:create"),createVendor)
vendorRouter.route('/logout').post(logout)

module.exports= {vendorRouter}