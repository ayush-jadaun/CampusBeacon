import BuyAndSell from "../models/buyandsell.model.js";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
  extractCloudinaryPublicId,
} from "../utils/cloudinary.js";

export const createBuyAndSellItem = asyncHandler(async (req, res) => {
  const {
    item_name,
    description,
    date_bought,
    owner_contact,
    item_condition,
    price,
    category,
  } = req.body;

  // Validate inputs
  if (price < 0) throw new ApiError("Price must be positive", 405);

  if (!item_name?.trim()) {
    throw new ApiError("Item name is required", 400);
  }

  if (
    !item_condition ||
    !["Good", "Fair", "Poor", "New", "Like New", "Fair"].includes(
      item_condition
    )
  ) {
    throw new ApiError(
      "Valid item condition is required (Good, Fair, or Poor)",
      400
    );
  }

  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError("Authentication required", 401);
  }

  let image_url = null;
  if (req.file) {
    try {
      const uploadedUrl = await uploadImageToCloudinary(req.file.path);
      if (!uploadedUrl) {
        throw new ApiError("Failed to upload image", 500);
      }
      image_url = uploadedUrl;
      console.log("Successfully uploaded image to Cloudinary:", image_url);
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw new ApiError("Failed to upload image: " + error.message, 500);
    }
  }

  try {
    if (req.file && !image_url) {
      throw new ApiError("Image upload failed", 500);
    }

    const newItem = await BuyAndSell.create({
      item_name,
      description,
      date_bought: date_bought || new Date(),
      owner_contact,
      image_url,
      userId,
      item_condition,
      price,
      category,
    });

    console.log("Successfully created item in database:", newItem.id);

    return res
      .status(201)
      .json(new ApiResponse(201, newItem, "Item created successfully"));
  } catch (error) {
    console.error("Database error:", error);
    throw new ApiError(
      "Error creating item in database: " + error.message,
      500
    );
  }
});

export const updateBuyAndSellItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    item_name,
    description,
    date_bought,
    owner_contact,
    item_condition,
    price,
    category,
    is_sold,
  } = req.body;

  const item = await BuyAndSell.findByPk(id);
  if (!item) throw new ApiError("Item not found", 404);

  if (item.userId !== req.user?.id && !req.user?.roles?.includes("admin")) {
    throw new ApiError("User is not authorized to update this item", 403);
  }

  if (
    item_condition &&
    !["New", "Like New", "Good", "Fair", "Poor"].includes(item_condition)
  ) {
    throw new ApiError(
      "Valid item condition is required (New, Like New, Good, Fair, or Poor)",
      400
    );
  }

  if (price !== undefined && price < 0) {
    throw new ApiError("Price must be positive", 405);
  }

  let image_url = item.image_url;

  if (req.file) {
    if (item.image_url) {
      const publicId = extractCloudinaryPublicId(item.image_url);
      if (publicId) {
        try {
          await deleteImageFromCloudinary(publicId);
          console.log(
            `Deleted old image with public_id: ${publicId} from Cloudinary`
          );
        } catch (error) {
          console.error("Error deleting old image from Cloudinary:", error);

        }
      }
    }
    // Upload the new image
    image_url = await uploadImageToCloudinary(req.file.path, "buy-and-sell");
  }

  Object.assign(item, {
    item_name: item_name ?? item.item_name,
    description: description ?? item.description,
    date_bought: date_bought ?? item.date_bought,
    owner_contact: owner_contact ?? item.owner_contact,
    item_condition: item_condition ?? item.item_condition,
    category: category ?? item.category,
    is_sold:
      is_sold === undefined
        ? item.is_sold
        : is_sold === true || is_sold === "true",
    image_url,
    price: price ?? item.price,
  });

  await item.save();
  return res
    .status(200)
    .json(new ApiResponse(200, item, "Item updated successfully"));
});

export const deleteBuyAndSellItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await BuyAndSell.findByPk(id);
  if (!item) throw new ApiError("Item not found", 404);

 if (item.userId !== req.user?.id && !req.user?.roles?.includes("admin")) {
   throw new ApiError("User is not authorized to delete this item", 403);
 }

  // Delete image from Cloudinary if it exists
  if (item.image_url) {
    const publicId = extractCloudinaryPublicId(item.image_url);
    if (publicId) {
      try {
        await deleteImageFromCloudinary(publicId);
        console.log(
          `Deleted image with public_id: ${publicId} from Cloudinary`
        );
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        // Optionally, decide whether to continue or throw an error.
      }
    }
  }

  await item.destroy();
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Item deleted successfully"));
});

export const getBuyAndSellItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await BuyAndSell.findByPk(id);
  if (!item) throw new ApiError("Item not found", 404);

  return res
    .status(200)
    .json(new ApiResponse(200, item, "Item retrieved successfully"));
});

export const getAllBuyAndSellItems = asyncHandler(async (req, res) => {
  const { category, include_sold, limit, offset } = req.query;

  const where = {};
  if (category) where.category = category;
  if (include_sold !== "true") where.is_sold = false;

  const items = await BuyAndSell.findAll({
    where,
    order: [["createdAt", "DESC"]],
    ...(limit ? { limit: Math.min(parseInt(limit, 10) || 50, 100) } : {}),
    ...(offset ? { offset: parseInt(offset, 10) || 0 } : {}),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, items, "All items retrieved successfully"));
});

export const getUserItems = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user?.id;

  const items = await BuyAndSell.findAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        as: "users",
        attributes: ["id", "name", "email"],
      },
    ],
  });

  return res
    .status(200)
    .json(new ApiResponse(200, items, "User's items retrieved successfully"));
});
