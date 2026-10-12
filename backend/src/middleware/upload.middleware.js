const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDirectory = path.resolve(
  __dirname,
  "../../uploads/documents"
);

// Ensure the upload directory exists.
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const filename =
      `${req.user.userId}-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`;

    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Only JPG, PNG, and PDF files are allowed"));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

module.exports = upload;