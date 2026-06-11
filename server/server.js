import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import scheduleUnverifiedUserCleanup from "./src/utils/killUnverifiedUser.js";
import { initializeAssociations } from "./src/models/association.js";

// Import routes
import userRoutes from "./src/routes/user.routes.js";
import contactRoutes from "./src/routes/contact.routes.js";
import lostAndFoundRoutes from "./src/routes/lostandfound.routes.js";
import buyAndSellRoutes from "./src/routes/buyandsell.routes.js";
import eateriesRoutes from "./src/routes/eateries.routes.js";
import hostelsRoutes from "./src/routes/hostel.routes.js";
import ridesRoutes from "./src/routes/ride.routes.js";
import resourcesRoutes from "./src/routes/resources.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";
import chatBotRoutes from "./src/routes/chatBot.routes.js";
import clubRoutes from "./src/routes/club.routes.js";
import coordinatorRoutes from "./src/routes/coordinator.routes.js";
import eventRoutes from "./src/routes/events.routes.js";
import enrollmentRoutes from "./src/routes/enrollment.routes.js"
import attendanceRoutes from "./src/routes/attendance.routes.js"

dotenv.config({ path: "./.env" });
const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration
// Browsers reject origin "*" combined with credentials, so list web origins
// explicitly. Native mobile apps send no Origin header and pass through.
const allowedOrigins = [
  "http://localhost:5173",
  "https://campus-beacon.vercel.app",
  "https://campusbeacon.onrender.com",
];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-session-id"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Apply CORS middleware
app.use(cors(corsOptions));


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
scheduleUnverifiedUserCleanup();


// Test route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/lost-and-found", lostAndFoundRoutes);
app.use("/api/buy-and-sell", buyAndSellRoutes);
app.use("/api/hostels", hostelsRoutes);
app.use("/api/rides", ridesRoutes);
app.use("/api/eateries", eateriesRoutes);
app.use("/api/resources", resourcesRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/chatbot", chatBotRoutes);
app.use("/api/club", clubRoutes);
app.use("/api/coordinator", coordinatorRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/enrollments", enrollmentRoutes);

import { connectDb } from "./src/db/db.js";
import { EventRegistration } from "./src/models/eventRegistration.model.js";


const startServer = async () => {
  try {
    console.log("Connecting to database...");
    await connectDb();
    console.log("Database connected successfully");

    // Global sync is disabled; create newer tables individually if missing
    await EventRegistration.sync();

    const httpServer = createServer(app);

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

initializeAssociations();

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  process.exit(1);
});

startServer();
