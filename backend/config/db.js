const mongoose=require("mongoose");
const connectDB=async()=>{
    try {
        
        const URL=await mongoose.connect(`mongodb://localhost:27017/vendorsystem`)
        console.log("Database connected successfully");

    } catch (error) {
        console.log("Failed to connect Database ",error)
        process.exit(1)
    }
}

module.exports={connectDB};