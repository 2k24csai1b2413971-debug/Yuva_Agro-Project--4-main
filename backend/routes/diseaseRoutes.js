const express = require('express');
const router = express.Router();
const multer = require('multer');
const { detectDisease, ALLOWED_MIME_TYPES } = require('../controllers/diseaseController');

// Configure multer to store files in memory (safe: never writes untrusted files to disk)
const storage = multer.memoryStorage();

// Limit file size to 5MB
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const err = new Error('INVALID_FILE_TYPE');
      err.code = 'INVALID_FILE_TYPE';
      cb(err);
    }
  },
});

// Middleware wrapper to catch Multer errors gracefully and return JSON
function uploadMiddleware(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File size exceeds 5MB limit. Please upload a smaller image.',
        });
      }
      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
          error: 'Invalid file format. Only JPEG, PNG, and WebP images are allowed.',
        });
      }
      return res.status(400).json({
        error: `File upload error: ${err.message}`,
      });
    }
    next();
  });
}

// POST /api/disease/detect
router.post('/detect', uploadMiddleware, detectDisease);

module.exports = router;
