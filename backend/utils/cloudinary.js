const fs =require('fs')
const  cloudinary =require( 'cloudinary').v2;

require('dotenv').config(); // at the top of the file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


 
    
const uploadOnCloudinary=async(localFilePath)=>{
    try {
        if(!localFilePath) return null;
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        }) 
        console.log( "file successfully uploaded on cloudinary",response.url)
        fs.unlinkSync(localFilePath)
        return response; 
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
    }
}    

module.exports= {uploadOnCloudinary}