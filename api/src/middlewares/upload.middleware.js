import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate a temporary name, we might rename it later or keep it
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    // Accept images, audio, video, docs, pdfs
    // detailed mime type checking can be added here
    // For now, allowing all as per "any multimedia file" + docs
    cb(null, true);
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 150 * 1024 * 1024, // 150 MB
    },
    fileFilter: fileFilter,
});

export default upload;
