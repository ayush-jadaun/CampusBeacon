import express from "express";
import multer from "multer";
import filterInputMiddleware from "../middlewares/filter.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

import {
  createHostel,
  getAllHostels,
  getHostelById,
  editHostel,
  deleteHostel,
  createMenu,
  getMenuByHostel,
  getMenuById,
  getMenuMeal,
  updateMenuMeal,
  // New updateMenu route
  updateMenu,
  deleteMenuMeal,
  createOfficial,
  getAllOfficials,
  getOfficialsByHostel,
  getOfficialById,
  editOfficial,
  deleteOfficial,
  createComplaint,
  getAllComplaints,
  getComplaintById,
  getComplaintsByHostel,
  updateComplaint,
  deleteComplaint,
  createNotification,
  getNotifications,
  getHostelNotifications,
  updateNotification,
  deleteNotification,
} from "../controllers/hostels.controller.js";

const router = express.Router();
const upload = multer({ dest: "./public/temp" });
const hostelStaff = requireRole("admin", "hostel_president");

/*
=============================
        Hostel Routes
=============================
*/
router.post("/", authMiddleware, requireRole("admin"), createHostel);
router.get("/", authMiddleware, getAllHostels);
router.get("/:id", authMiddleware, getHostelById);
router.put("/:id", authMiddleware, requireRole("admin"), editHostel);
router.delete("/:id", authMiddleware, requireRole("admin"), deleteHostel);

/*
=============================
        Menu Routes
=============================
*/
router.post("/menus", authMiddleware, hostelStaff, createMenu);
router.get("/menus/hostel/:hostel_id", authMiddleware, getMenuByHostel);
router.get("/menus/:menu_id", authMiddleware, getMenuById);
router.get("/menus/meal/:hostel_id/:day/:meal", authMiddleware, getMenuMeal);
// New route for updating entire menu
router.put("/menus/:menu_id", authMiddleware, hostelStaff, updateMenu);
router.put(
  "/menus/meal/:hostel_id/:day/:meal",
  authMiddleware,
  hostelStaff,
  updateMenuMeal
);
router.delete(
  "/menus/meal/:hostel_id/:day/:meal",
  authMiddleware,
  hostelStaff,
  deleteMenuMeal
);

/*
=============================
        Officials Routes
=============================
*/
router.post("/officials", authMiddleware, hostelStaff, createOfficial);
router.get("/officials", authMiddleware, getAllOfficials);
router.get(
  "/officials/hostel/:hostel_id",
  authMiddleware,
  getOfficialsByHostel
);
router.get("/officials/:official_id", authMiddleware, getOfficialById);
router.put(
  "/officials/:official_id",
  authMiddleware,
  hostelStaff,
  editOfficial
);
router.delete(
  "/officials/:official_id",
  authMiddleware,
  hostelStaff,
  deleteOfficial
);

/*
=============================
        Complaint Routes
=============================
*/
router.post("/complaints", authMiddleware, createComplaint);
router.get("/complaints", authMiddleware, getAllComplaints);
router.get("/complaints/:complaint_id", authMiddleware, getComplaintById);
router.get(
  "/complaints/hostel/:hostel_id",
  authMiddleware,
  getComplaintsByHostel
);
router.put("/complaints/:complaint_id", authMiddleware, updateComplaint);
router.delete("/complaints/:complaint_id", authMiddleware, deleteComplaint);

/*
=============================
        Notifications Routes
=============================
*/
router.post(
  "/notifications",
  upload.single("file"),
  authMiddleware,
  hostelStaff,
  filterInputMiddleware,
  createNotification
);
router.get("/notifications", authMiddleware, getNotifications);
router.get("/notifications/:hostel_id", authMiddleware, getHostelNotifications);
router.put(
  "/notifications/:notification_id",
  upload.single("file"),
  authMiddleware,
  hostelStaff,
  filterInputMiddleware,
  updateNotification
);
router.delete(
  "/notifications/:notification_id",
  authMiddleware,
  hostelStaff,
  deleteNotification
);

export default router;
