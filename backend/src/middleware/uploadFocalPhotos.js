const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  console.log("Multer received file:", file.originalname, file.mimetype);
  const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
  if (!ok) return cb(new Error("Only JPEG, PNG, WEBP images are allowed"));
  cb(null, true);
};

module.exports.uploadFocalPhotos = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).fields([
  { name: "photo", maxCount: 1 },
  { name: "alternativeFPImage", maxCount: 1 },
]);
