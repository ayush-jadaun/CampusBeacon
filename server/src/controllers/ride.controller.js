import Rides from "../models/ride.model.js";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { Op } from "sequelize";
import RideParticipant from "../models/rideParticipant.model.js";

export const createRide = asyncHandler(async (req, res) => {
  const {
    pickupLocation,
    dropLocation,
    departureDateTime,
    totalSeats,
    estimatedCost,
    description,
    phoneNumber,
  } = req.body;

  // Validation
  if (!pickupLocation?.trim() || !dropLocation?.trim()) {
    throw new ApiError("Pickup and drop locations are required", 400);
  }

  if (!departureDateTime) {
    throw new ApiError("Departure date and time is required", 400);
  }

  if (!totalSeats || totalSeats < 1) {
    throw new ApiError("Total seats must be at least 1", 400);
  }

  if (estimatedCost && estimatedCost < 0) {
    throw new ApiError("Estimated cost cannot be negative", 400);
  }

  const creatorId = req.user?.id;
  if (!creatorId) {
    throw new ApiError("Authentication required", 401);
  }

  try {
    const newRide = await Rides.create({
      creatorId,
      pickupLocation,
      dropLocation,
      departureDateTime,
      totalSeats,
      availableSeats: totalSeats,
      estimatedCost,
      description,
      phoneNumber,
      status: "OPEN",
    });

    return res
      .status(201)
      .json(new ApiResponse(201, newRide, "Ride created successfully"));
  } catch (error) {
    console.error("Database error:", error);
    throw new ApiError(
      "Error creating ride in database: " + error.message,
      500
    );
  }
});

export const updateRide = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    pickupLocation,
    dropLocation,
    departureDateTime,
    totalSeats,
    estimatedCost,
    description,
    phoneNumber,
    status,
  } = req.body;

  const ride = await Rides.findByPk(id);
  if (!ride) throw new ApiError("Ride not found", 404);

  // Check if user is admin or creator
  const isAdmin = req.user?.roles?.includes("admin");
  if (ride.creatorId !== req.user?.id && !isAdmin) {
    throw new ApiError("Unauthorized", 403);
  }

  if (status && !["OPEN", "FULL", "CANCELLED", "COMPLETED"].includes(status)) {
    throw new ApiError(
      "Invalid status. Must be OPEN, FULL, CANCELLED, or COMPLETED",
      400
    );
  }

  // Ensure we don't reduce seats below what's already taken
  if (totalSeats && totalSeats < ride.totalSeats - ride.availableSeats) {
    throw new ApiError(
      "Cannot reduce total seats below number of seats already taken",
      400
    );
  }

  Object.assign(ride, {
    pickupLocation: pickupLocation ?? ride.pickupLocation,
    dropLocation: dropLocation ?? ride.dropLocation,
    departureDateTime: departureDateTime ?? ride.departureDateTime,
    totalSeats: totalSeats ?? ride.totalSeats,
    estimatedCost: estimatedCost ?? ride.estimatedCost,
    description: description ?? ride.description,
    phoneNumber: phoneNumber ?? ride.phoneNumber,
    status: status ?? ride.status,
    availableSeats: totalSeats
      ? totalSeats - (ride.totalSeats - ride.availableSeats)
      : ride.availableSeats,
  });

  await ride.save();
  return res
    .status(200)
    .json(new ApiResponse(200, ride, "Ride updated successfully"));
});

export const deleteRide = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find the ride with its participants
  const ride = await Rides.findByPk(id, {
    include: [
      {
        model: RideParticipant,
        as: "participants",
      },
    ],
  });

  if (!ride) {
    throw new ApiError("Ride not found", 404);
  }

  // Check if user is admin or creator
  const isAdmin = req.user?.roles?.includes("admin");
  if (ride.creatorId !== req.user?.id && !isAdmin) {
    throw new ApiError("Unauthorized", 403);
  }

  try {
    // First delete all participants
    if (ride.participants && ride.participants.length > 0) {
      await RideParticipant.destroy({
        where: { rideId: id },
      });
    }

    // Then delete the ride
    await ride.destroy();

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Ride deleted successfully"));
  } catch (error) {
    console.error("Error deleting ride:", error);
    throw new ApiError("Error deleting ride: " + error.message, 500);
  }
});

export const getRide = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ride = await Rides.findByPk(id, {
    include: [
      {
        model: User,
        as: "creator",
        attributes: ["id", "name", "email"],
      },
      {
        model: RideParticipant,
        as: "participants",
        include: [
          {
            model: User,
            as: "participant",
            attributes: ["id", "name", "email"],
          },
        ],
      },
    ],
  });

  if (!ride) throw new ApiError("Ride not found", 404);

  return res
    .status(200)
    .json(new ApiResponse(200, ride, "Ride retrieved successfully"));
});

export const getAllRides = asyncHandler(async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const rides = await Rides.findAll({
      where: {
        status: "OPEN",
        departureDateTime: {
          [Op.gt]: new Date(),
        },
      },
      ...(limit ? { limit: Math.min(parseInt(limit, 10) || 50, 100) } : {}),
      ...(offset ? { offset: parseInt(offset, 10) || 0 } : {}),
      order: [["departureDateTime", "ASC"]],
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
        {
          model: RideParticipant,
          as: "participants",
          include: [
            {
              model: User,
              as: "participant",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
      limit: 50, // Limit the number of rides returned
    });

    return res
      .status(200)
      .json(new ApiResponse(200, rides, "Rides retrieved successfully"));
  } catch (error) {
    console.error("Error in getAllRides:", error);
    throw new ApiError("Error retrieving rides: " + error.message, 500);
  }
});

export const getUserRides = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user?.id;

  if (!userId) {
    throw new ApiError("User ID is required", 400);
  }

  try {
    const rides = await Rides.findAll({
      where: { creatorId: userId },
      order: [["departureDateTime", "ASC"]],
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
        {
          model: RideParticipant,
          as: "participants",
          include: [
            {
              model: User,
              as: "participant",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
      limit: 20, // Limit the number of rides returned
    });

    return res
      .status(200)
      .json(new ApiResponse(200, rides, "User's rides retrieved successfully"));
  } catch (error) {
    console.error("Error in getUserRides:", error);
    throw new ApiError("Error retrieving user rides: " + error.message, 500);
  }
});

export const joinRide = asyncHandler(async (req, res) => {
  const { id } = req.params; // ride ID from URL params
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError("Authentication required", 401);
  }

  // Find the ride
  const ride = await Rides.findByPk(id);
  if (!ride) {
    throw new ApiError("Ride not found", 404);
  }

  // Check if ride is active
  if (ride.status !== "OPEN") {
    throw new ApiError("This ride is not available for joining", 400);
  }

  // Check if user already joined the ride
  const existingEntry = await RideParticipant.findOne({
    where: { rideId: id, userId },
  });
  if (existingEntry) {
    throw new ApiError("You have already joined this ride", 400);
  }

  // Count the number of participants currently in the ride
  const joinCount = await RideParticipant.count({ where: { rideId: id } });
  if (joinCount >= ride.totalSeats) {
    throw new ApiError("Ride is already full", 400);
  }

  // Create new join record
  await RideParticipant.create({ rideId: id, userId });

  // Decrement availableSeats by 1
  ride.availableSeats = ride.availableSeats - 1;

  // Update ride status if full
  if (ride.availableSeats === 0) {
    ride.status = "FULL";
  }

  await ride.save();

  // Fetch all participants with user details
  const participants = await RideParticipant.findAll({
    where: { rideId: id },
    include: [
      {
        model: User,
        as: "participant",
        attributes: ["id", "name", "email"],
      },
    ],
  });

  return res
    .status(200)
    .json(new ApiResponse(200, participants, "Joined ride successfully"));
});

export const unjoinRide = asyncHandler(async (req, res) => {
  const { id } = req.params; // ride ID from URL params
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError("Authentication required", 401);
  }

  // Find the ride
  const ride = await Rides.findByPk(id);
  if (!ride) {
    throw new ApiError("Ride not found", 404);
  }

  // Check if user has already joined the ride
  const existingEntry = await RideParticipant.findOne({
    where: { rideId: id, userId },
  });
  if (!existingEntry) {
    throw new ApiError("You have not joined this ride", 400);
  }

  // Remove the join record
  await existingEntry.destroy();

  // Increment availableSeats by 1
  ride.availableSeats = ride.availableSeats + 1;

  // Update ride status if it was full
  if (ride.status === "FULL") {
    ride.status = "OPEN";
  }

  await ride.save();

  // Fetch updated participants list
  const participants = await RideParticipant.findAll({
    where: { rideId: id },
    include: [
      {
        model: User,
        as: "participant",
        attributes: ["id", "name", "email"],
      },
    ],
  });

  return res
    .status(200)
    .json(new ApiResponse(200, participants, "Cancelled join successfully"));
});
