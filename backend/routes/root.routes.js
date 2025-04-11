const express = require('express');

const { createSuperVendor } =require( '../controllers/root.controller.js');

const router=express.Router();

router.post('/super-vendor', 
  (req, res, next) => {
    if (process.env.ALLOW_ROOTING === 'true') next();
    else res.status(403).end();
  },
  createSuperVendor
); 

module.exports= router