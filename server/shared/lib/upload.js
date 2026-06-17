import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function makeStorage(folder) {
  return new CloudinaryStorage({
    cloudinary,
    params: (req) => ({
      folder,
      public_id: `${req.user.id}-${Date.now()}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    }),
  });
}

const imageFilter = (_, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

export const uploadAvatar = multer({
  storage: makeStorage("nazairo/avatars"),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("avatar");

export const uploadCover = multer({
  storage: makeStorage("nazairo/covers"),
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("cover");
