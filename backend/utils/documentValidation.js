const cron =require( 'node-cron');
const { Driver } =require( '../models/Driver.model.js');
const nodemailer=require("nodemailer");
require("dotenv").config()

const transporter = nodemailer.createTransport({
            pool: true,
             host: 'smtp.gmail.com',
    port: 587, 
    secure: false, 
            auth: {
                user: process.env.EMAIL_USER,      
        pass: process.env.EMAIL_PASS 
        }});
const checkDocumentExpiry = async () => {
try {
    const expiredDrivers = await Driver.find({
      $or: [
        { 'license.expiryDate': { $lt: new Date() } },
        { 'documents.expiryDate': { $lt: new Date() } }
      ]
    });
  
    expiredDrivers.forEach(async driver => {
      driver.status = 'INACTIVE';
      await driver.save();
      
      console.log(`${driver.fullName} documents are expired please update them!`);
      const mailOptions = {
        from: 'nikhilagrawal0605@gmail.com',
        to: driver.email, 
        subject: 'Document Expiry Notice',
        text: `Hello ${driver.fullName},\n\nYour license or other documents have expired. Please update them as soon as possible to avoid any disruptions.\n\nThank you.`
      };
       transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(`Failed to send email to ${driver.fullName}:`, error);
        } else {
          console.log(`Email sent to ${driver.fullName}:`, info.response);
        }
      });
    })
} catch (error) {
  console.log("Error checking document expiry:", error);
}
}

// Run daily at midnight
cron.schedule('0 0 * * *', checkDocumentExpiry);