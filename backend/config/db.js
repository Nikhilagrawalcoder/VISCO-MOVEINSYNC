const mongoose=require("mongoose");
require('dotenv').config();
const connectDB=async()=>{
    try {
        
        const URL=await mongoose.connect(process.env.MONGODB_URL)
        console.log("Database connected successfully");

    } catch (error) {
        console.log("Failed to connect Database ",error)
        process.exit(1)
    }
}

module.exports={connectDB};