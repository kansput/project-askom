import multer from "multer";
import fs from "fs";
import path from "path";

// Storage dinamis berdasarkan id (tanpa query DB di sini)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            const userId = req.user?.id; 
            if (!userId) return cb(new Error("userId tidak ditemukan dari token"), null);

            const folderName = `user_${userId}`;
            const uploadPath = path.join("src/uploads/str", folderName);



            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }

            cb(null, uploadPath);
        } catch (err) {
            cb(err, null);
        }
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        cb(null, Date.now() + "-" + safeName);
    },
});

const limits = { fileSize: 20 * 1024 * 1024 }; // max 20MB
const strUpload = multer({ storage, limits });

export { strUpload };
