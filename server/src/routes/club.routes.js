import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import filterInputMiddleware from "../middlewares/filter.middleware.js";

import {
  createClub,
  getAllClubs,
  getClubById,
  updateClub,
  deleteClub,
} from "../controllers/clubs.controller.js";

const router = express.Router();


router.post(
  "/clubs",
  authMiddleware,
  requireRole("admin", "coordinator"),
  upload.array("images", 5),
  filterInputMiddleware,
  createClub
);
router.get("/clubs", getAllClubs);
router.get("/clubs/:id", getClubById);
router.put(
  "/clubs/:id",
  authMiddleware,
  requireRole("admin", "coordinator"),
  upload.array("images", 5),
  filterInputMiddleware,
  updateClub
);
router.delete(
  "/clubs/:id",
  authMiddleware,
  requireRole("admin", "coordinator"),
  deleteClub
);

export default router
