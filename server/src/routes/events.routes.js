import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import filterInputMiddleware from "../middlewares/filter.middleware.js";


import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  getMyEventRegistrations,
  getEventRegistrationCounts,
} from "../controllers/events.controller.js";

const router = express.Router();


// Event routes
router.post(
  "/events",
  authMiddleware,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 5 },
  ]),
  filterInputMiddleware,
  createEvent
);
router.get("/events", getAllEvents);
// Registration routes (static paths before "/events/:id")
router.get("/events/registrations/me", authMiddleware, getMyEventRegistrations);
router.get("/events/registrations/counts", getEventRegistrationCounts);
router.get("/events/:id", getEventById);
router.post("/events/:id/register", authMiddleware, registerForEvent);
router.delete("/events/:id/register", authMiddleware, unregisterFromEvent);
router.put(
  "/events/:id",
  authMiddleware,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 5 },
  ]),
  filterInputMiddleware,
  updateEvent
);
router.delete("/events/:id", authMiddleware, deleteEvent);

export default router;
