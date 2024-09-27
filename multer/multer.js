const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Set the upload directory
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);  // Use original file name
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
