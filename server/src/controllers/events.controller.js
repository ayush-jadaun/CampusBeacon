import asyncHandler from "../utils/asyncHandler.js";
import { Event } from "../models/events.model.js";
import { Club } from "../models/clubs.model.js";
import { EventCoordinator } from "../models/eventcoordinator.model.js";
import { EventRegistration } from "../models/eventRegistration.model.js";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "../utils/cloudinary.js";
import { Coordinator } from "../models/coordinators.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";

export const createEvent = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    club_id,
    date,
    location,
    social_media_links,
    coordinator_ids,
    max_participants,
  } = req.body;

  if (!name || !description || !club_id || !date || !location) {
    throw new ApiError(400, "Missing required event details");
  }

  let maxParticipants = null;
  if (max_participants !== undefined && max_participants !== null && max_participants !== "") {
    maxParticipants = parseInt(max_participants, 10);
    if (isNaN(maxParticipants) || maxParticipants < 1) {
      throw new ApiError("max_participants must be a positive integer", 400);
    }
  }

  // Check if club exists
  const clubExists = await Club.findByPk(club_id);
  if (!clubExists) {
    throw new ApiError(404, "Club not found");
  }

  // Process uploaded images
  let imageUrls = [];
  if (req.files && req.files.images) {
    const uploadPromises = req.files.images.map((file) =>
      uploadImageToCloudinary(file.path)
    );
    imageUrls = await Promise.all(uploadPromises);
  }

  // Process uploaded videos
  let videoUrls = [];
  if (req.files && req.files.videos) {
    const uploadPromises = req.files.videos.map((file) =>
      uploadImageToCloudinary(file.path)
    );
    videoUrls = await Promise.all(uploadPromises);
  }

  // Create event
  const event = await Event.create({
    name,
    description,
    club_id,
    date: new Date(date),
    location,
    images: imageUrls,
    videos: videoUrls,
    max_participants: maxParticipants,
    social_media_links: social_media_links
      ? JSON.parse(social_media_links)
      : [],
  });

  // Add coordinators if any
  if (coordinator_ids && coordinator_ids.length > 0) {
    const ids =
      typeof coordinator_ids === "string"
        ? JSON.parse(coordinator_ids)
        : coordinator_ids;

    const coordinatorPromises = ids.map((coordinator_id) =>
      EventCoordinator.create({
        event_id: event.id,
        coordinator_id,
      })
    );

    await Promise.all(coordinatorPromises);
  }

  return res.status(201).json({
    success: true,
    event,
  });
});

export const getAllEvents = asyncHandler(async (req, res) => {
  const { club_id } = req.query;

  let whereClause = {};
  if (club_id) {
    whereClause.club_id = club_id;
  }

  const events = await Event.findAll({
    where: whereClause,
    include: [
      {
        model: Club,
        attributes: ["id", "name"],
      },
    ],
  });

  return res.status(200).json({
    success: true,
    events,
  });
});

export const getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findByPk(id, {
    include: [
      {
        model: Club,
        attributes: ["id", "name"], // Keep this include
      },
      {
        model: Coordinator, // <<< --- ADD THIS INCLUDE
        // Specify which coordinator attributes you need on the frontend
        attributes: [
          "id",
          "name",
          "designation",
          "images", // Assuming images is an array of URLs
          "contact",
          "social_media_links",
        ],
        through: {
          // Important: Exclude attributes from the join table (EventCoordinator)
          // unless you specifically need them (e.g., createdAt timestamp of the association)
          attributes: [],
        },
      },
    ],
  });

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  // Sequelize will return the associated coordinators in an array, likely named `Coordinators`
  // (pluralized model name) within the event object.
  // console.log(JSON.stringify(event, null, 2)); // Optional: Log to verify structure

  return res.status(200).json({
    success: true,
    event, // The event object now includes the Coordinators array
  });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    club_id,
    date,
    location,
    social_media_links,
    coordinator_ids,
    max_participants,
  } = req.body;

  const event = await Event.findByPk(id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (max_participants !== undefined) {
    if (max_participants === null || max_participants === "") {
      event.max_participants = null;
    } else {
      const maxParticipants = parseInt(max_participants, 10);
      if (isNaN(maxParticipants) || maxParticipants < 1) {
        throw new ApiError("max_participants must be a positive integer", 400);
      }
      event.max_participants = maxParticipants;
    }
  }

  // Check if club exists if club_id is provided
  if (club_id) {
    const clubExists = await Club.findByPk(club_id);
    if (!clubExists) {
      throw new ApiError(404, "Club not found");
    }
  }

  // Process new images
  let newImageUrls = [];
  if (req.files && req.files.images) {
    const uploadPromises = req.files.images.map((file) =>
      uploadImageToCloudinary(file.path)
    );
    newImageUrls = await Promise.all(uploadPromises);
  }

  // Process new videos
  let newVideoUrls = [];
  if (req.files && req.files.videos) {
    const uploadPromises = req.files.videos.map((file) =>
      uploadImageToCloudinary(file.path)
    );
    newVideoUrls = await Promise.all(uploadPromises);
  }

  // Update event
  event.name = name || event.name;
  event.description = description || event.description;
  event.club_id = club_id || event.club_id;
  event.date = date ? new Date(date) : event.date;
  event.location = location || event.location;

  if (social_media_links) {
    event.social_media_links = JSON.parse(social_media_links);
  }

  if (newImageUrls.length > 0) {
    if (req.body.deleteExistingImages === "true") {
      // Delete old images
      const deletePromises = event.images.map((imageUrl) =>
        deleteImageFromCloudinary(imageUrl)
      );
      await Promise.all(deletePromises);
      event.images = newImageUrls;
    } else {
      event.images = [...event.images, ...newImageUrls];
    }
  }

  if (newVideoUrls.length > 0) {
    if (req.body.deleteExistingVideos === "true") {
      // Delete old videos
      const deletePromises = event.videos.map((videoUrl) =>
        deleteImageFromCloudinary(videoUrl)
      );
      await Promise.all(deletePromises);
      event.videos = newVideoUrls;
    } else {
      event.videos = [...event.videos, ...newVideoUrls];
    }
  }

  await event.save();

  // Update coordinators if provided
  if (coordinator_ids) {
    const ids =
      typeof coordinator_ids === "string"
        ? JSON.parse(coordinator_ids)
        : coordinator_ids;

    // Remove existing associations
    await EventCoordinator.destroy({
      where: { event_id: event.id },
    });

    // Create new associations
    const coordinatorPromises = ids.map((coordinator_id) =>
      EventCoordinator.create({
        event_id: event.id,
        coordinator_id,
      })
    );

    await Promise.all(coordinatorPromises);
  }

  return res.status(200).json({
    success: true,
    event,
  });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findByPk(id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  // Delete images from cloudinary
  if (event.images && event.images.length > 0) {
    const deletePromises = event.images.map((imageUrl) =>
      deleteImageFromCloudinary(imageUrl)
    );
    await Promise.all(deletePromises);
  }

  // Delete videos from cloudinary
  if (event.videos && event.videos.length > 0) {
    const deletePromises = event.videos.map((videoUrl) =>
      deleteImageFromCloudinary(videoUrl)
    );
    await Promise.all(deletePromises);
  }

  // Delete coordinator associations
  await EventCoordinator.destroy({
    where: { event_id: event.id },
  });

  // Delete registrations
  await EventRegistration.destroy({
    where: { event_id: event.id },
  });

  await event.destroy();

  return res.status(200).json({
    success: true,
    message: "Event deleted successfully",
  });
});

/*
==============================
     Event Registrations
==============================
*/

export const registerForEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const event = await Event.findByPk(id);
  if (!event) {
    throw new ApiError("Event not found", 404);
  }

  if (new Date(event.date) < new Date()) {
    throw new ApiError("Cannot register for a past event", 400);
  }

  if (event.max_participants !== null && event.max_participants !== undefined) {
    const currentCount = await EventRegistration.count({
      where: { event_id: event.id },
    });
    if (currentCount >= event.max_participants) {
      throw new ApiError("Event is full", 409);
    }
  }

  const [registration, created] = await EventRegistration.findOrCreate({
    where: { event_id: event.id, user_id: userId },
  });

  if (!created) {
    throw new ApiError("Already registered for this event", 409);
  }

  const registrationCount = await EventRegistration.count({
    where: { event_id: event.id },
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { registration, registrationCount },
        "Registered for event"
      )
    );
});

export const unregisterFromEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const deleted = await EventRegistration.destroy({
    where: { event_id: id, user_id: userId },
  });

  if (!deleted) {
    throw new ApiError("You are not registered for this event", 404);
  }

  const registrationCount = await EventRegistration.count({
    where: { event_id: id },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { registrationCount }, "Unregistered from event")
    );
});

export const getMyEventRegistrations = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const registrations = await EventRegistration.findAll({
    where: { user_id: userId },
    attributes: ["id", "event_id", "createdAt"],
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { registrations }, "My event registrations"));
});

export const getEventRegistrationCounts = asyncHandler(async (req, res) => {
  const counts = await EventRegistration.findAll({
    attributes: [
      "event_id",
      [
        EventRegistration.sequelize.fn(
          "COUNT",
          EventRegistration.sequelize.col("id")
        ),
        "count",
      ],
    ],
    group: ["event_id"],
    raw: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { counts }, "Event registration counts"));
});
