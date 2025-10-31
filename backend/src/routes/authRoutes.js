import { Router } from "express";
import { register, login, changePassword, logout } from "../controllers/authController.js";
import { verifyToken} from "../middlewares/authMiddleware.js";

const router = Router();

// Test route
router.get("/", (req, res) => {
  res.json({ message: "Auth route works!" });
});

// Register user (opsional)
router.post("/register", register);

// Login user
router.post("/login", login);

// Logout user (butuh token aktif)
router.post("/logout", verifyToken, logout);

// Change password (butuh token aktif)
router.post("/change-password", verifyToken, changePassword);



export default router;
