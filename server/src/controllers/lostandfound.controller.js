import LostAndFound from "../models/lostandfound.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
  extractCloudinaryPublicId,
} from "../utils/cloudinary.js";

export const createLostItem = asyncHandler(async (req, res) => {
  const {
    item_name,
    description,
    location_found,
    date_found,
    owner_contact,
    status,
  } = req.body;

  if (!item_name?.trim()) {
    throw new ApiError("Item name is required", 400);
  }

  if (status && !["lost", "found"].includes(status)) {
    throw new ApiError("Status must be 'lost' or 'found'", 400);
  }

  if (!req.user || !req.user.id) {
    throw new ApiError("User not authenticated", 401);
  }

  let image_url = null;
  if (req.file) {
    image_url = await uploadImageToCloudinary(req.file.path, "lost-and-found");
  }

  const newItem = await LostAndFound.create({
    item_name,
    description,
    location_found,
    date_found: date_found || new Date(),
    owner_contact,
    image_url,
    userId: req.user.id,
    status: status || "lost",
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, newItem, "Lost and found item created successfully")
    );
});

export const updateLostItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    item_name,
    description,
    location_found,
    date_found,
    owner_contact,
    status,
  } = req.body;

  const item = await LostAndFound.findByPk(id);
  if (!item) {
    throw new ApiError("Item not found", 404);
  }

  if (
    item.userId !== req.user?.id &&
    !req.user?.roles?.includes("admin")
  ) {
    throw new ApiError("User is not authorized to update this item", 403);
  }

  if (status && !["lost", "found"].includes(status)) {
    throw new ApiError("Status must be 'lost' or 'found'", 400);
  }

  let image_url = item.image_url;
  if (req.file) {
    // Delete the old image from Cloudinary if it exists
    if (item.image_url) {
      const publicId = extractCloudinaryPublicId(item.image_url);
      if (publicId) {
        try {
          await deleteImageFromCloudinary(publicId);
          console.log(`Deleted old image with public_id: ${publicId} from Cloudinary`);
        } catch (error) {
          console.error("Error deleting old image from Cloudinary:", error);
          // Optionally, you can decide to throw an error here.
        }
      }
    }
    image_url = await uploadImageToCloudinary(req.file.path, "lost-and-found");
  }

  item.item_name = item_name || item.item_name;
  item.description = description || item.description;
  item.location_found = location_found || item.location_found;
  item.date_found = date_found || item.date_found;
  item.owner_contact = owner_contact || item.owner_contact;
  item.status = status || item.status;
  item.image_url = image_url;

  await item.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, item, "Lost and found item updated successfully")
    );
});

export const deleteLostItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await LostAndFound.findByPk(id);
  if (!item) {
    throw new ApiError("Item not found", 404);
  }

  if (item.userId !== req.user?.id && !req.user?.roles?.includes("admin")) {
    throw new ApiError("User is not authorized to delete this item", 403);
  }

  // Delete image from Cloudinary if it exists
  if (item.image_url) {
    const publicId = extractCloudinaryPublicId(item.image_url);
    if (publicId) {
      try {
        await deleteImageFromCloudinary(publicId);
        console.log(`Deleted image with public_id: ${publicId} from Cloudinary`);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        // Optionally, decide whether to continue or throw an error.
      }
    }
  }

  await item.destroy();

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "Lost and found item deleted successfully")
    );
});

export const getLostItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await LostAndFound.findByPk(id);
  if (!item) {
    throw new ApiError("Item not found", 404);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, item, "Lost and found item retrieved successfully")
    );
});

export const getAllLostItems = asyncHandler(async (req, res) => {
  const { status, limit, offset } = req.query;

  const where = {};
  if (status && ["lost", "found"].includes(status)) {
    where.status = status;
  }

  const items = await LostAndFound.findAll({
    where,
    order: [["createdAt", "DESC"]],
    ...(limit ? { limit: Math.min(parseInt(limit, 10) || 50, 100) } : {}),
    ...(offset ? { offset: parseInt(offset, 10) || 0 } : {}),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        items,
        "All lost and found items retrieved successfully"
      )
    );
});
