const express = require('express');


const { auth } = require('../middlewares/auth.middleware');
const { checkPermissions } = require('../middlewares/accessControl.middleware');
const { delegate, revoke } = require('../controllers/delegation.controller');


const delegationRouter=express.Router();

delegationRouter.use(auth)
delegationRouter.use(checkPermissions("delegation:manage"))

delegationRouter.route('/delegate').post(delegate)
delegationRouter.route('/revoke').post(revoke)

module.exports= {delegationRouter}