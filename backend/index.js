require('dotenv').config();
const { connectDB } = require('./config/db.js'); // Database connection
const { app } = require('./app.js'); // Main Server file
require('./utils/documentValidation.js'); // Start cron job

const PORT = process.env.PORT || 8000;

connectDB()
    .then(() => {
        const server = app.listen(PORT, () => {
            console.log(`Server started at port ${PORT}`);
        }); // If not any error comes then print this

        
        
    })
    .catch((error) => {
        console.error('ERROR:', error);
        process.exit(1); // if any error comes after server is started and during starting or during database connection then it will be catch it here.
    });