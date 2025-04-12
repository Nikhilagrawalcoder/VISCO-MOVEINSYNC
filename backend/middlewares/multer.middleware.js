const multer = require("multer");
const path = require('path');
const fs = require('fs');

// Ensure the destination folder exists or create it dynamically
const uploadPath = path.join(__dirname, 'public'); // You can adjust this path to fit your folder structure
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });  // Create the folder if it doesn't exist
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Here you can dynamically handle different destination paths if needed
    cb(null, uploadPath);  // Saving files to the 'public' directory
  },
  filename: function (req, file, cb) {
    // Ensuring unique file names to avoid conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extname = path.extname(file.originalname); // Get file extension (e.g., .jpg, .png)
    const filename = uniqueSuffix + extname; // Concatenate with the extension for a unique file name
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Optional: Limit the file size (10MB in this case)
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only .jpg, .jpeg, and .png file types are allowed'));
    }
    cb(null, true);
  }
});

module.exports = { upload };
