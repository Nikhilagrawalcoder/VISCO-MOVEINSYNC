const express=require("express");
const cors=require("cors");
const cookieParser=require("cookie-parser");

const app=express();

app.use(cors({
    origin:process.env.ORIGIN,
    methods:["GET","POST","PATCH","DELETE","PUT"],
    credentials:true,
}))
app.use(express.static("public"))

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

const {vendorRouter}=require("./routes/vendor.routes.js");
const rootRouter=require("./routes/root.routes.js");
const {delegationRouter}=require("./routes/delegation.routes.js");
const rideRouter=require("./routes/ride.routes.js");
const superVendorRouter=require("./routes/superVendor.routes.js");
const {errorHandler}=require("./middlewares/error.middleware.js");

app.use('/api/v1/root',rootRouter)
app.use('/api/v1/vendor',vendorRouter)
app.use('/api/v1/delegation',delegationRouter)
app.use('/api/v1/ride',rideRouter)
app.use('/api/v1/super-vendor',superVendorRouter)

app.use(errorHandler)

module.exports= {app};