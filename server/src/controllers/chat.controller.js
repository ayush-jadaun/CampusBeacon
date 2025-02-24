import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import Channel from "../models/channel.model.js";
import Message from "../models/message.model.js";
import { User } from "../models/association.js";

const getMessages = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const channel = await Channel.findOne({
    where: { name: channelId.toLowerCase() },
  });

  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  try {
    const messages = await Message.findAll({
      where: { channelId: channel.id },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"], // Update these attributes to match your User model
        },
      ],
      raw: false,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, messages, "Messages fetched successfully"));
  } catch (error) {
    console.error("Database error:", error);
    throw new ApiError(500, "Error fetching messages");
  }
});

const createMessage = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const { content } = req.body;
  const userId = req.user?.id;
  const currentTime = new Date("2025-02-14 07:23:59");

  if (!content?.trim()) {
    throw new ApiError(400, "Message content is required");
  }

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  const channel = await Channel.findOne({
    where: { name: channelId.toLowerCase() },
  });

  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  try {
    const message = await Message.create({
      content: content.trim(),
      userId,
      channelId: channel.id,
      createdAt: currentTime,
      updatedAt: currentTime,
    });

    // Get the user data
    const user = await User.findByPk(userId, {
      attributes: ["id", "name", "email"], // Update these attributes to match your User model
    });

    const messageData = {
      ...message.get({ plain: true }),
      User: user,
      username: "ayush-jadaun", // Current user's login
    };

    if (req.io) {
      req.io.to(`channel-${channel.id}`).emit("new-message", messageData);
    }

    return res
      .status(201)
      .json(new ApiResponse(201, messageData, "Message created successfully"));
  } catch (error) {
    console.error("Database error:", error);
    throw new ApiError(500, "Error creating message");
  }
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  const message = await Message.findByPk(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  if (message.userId !== userId) {
    throw new ApiError(403, "Not authorized to delete this message");
  }

  try {
    await message.destroy();

    if (req.io) {
      req.io
        .to(`channel-${message.channelId}`)
        .emit("message-deleted", messageId);
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, { messageId }, "Message deleted successfully")
      );
  } catch (error) {
    console.error("Database error:", error);
    throw new ApiError(500, "Error deleting message");
  }
});

const updateMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;
  const userId = req.user?.id;
  const currentTime = new Date("2025-02-14 07:23:59");

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  const message = await Message.findOne({
    where: { id: messageId },
    include: [
      {
        model: User,
        attributes: ["id", "name", "email"], // Update these attributes to match your User model
      },
    ],
  });

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  if (message.userId !== userId) {
    throw new ApiError(403, "Not authorized to edit this message");
  }

  try {
    message.content = content.trim();
    message.updatedAt = currentTime;
    await message.save();

    const messageData = {
      ...message.get({ plain: true }),
      username: "ayush-jadaun", // Current user's login
    };

    if (req.io) {
      req.io
        .to(`channel-${message.channelId}`)
        .emit("message-updated", messageData);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, messageData, "Message updated successfully"));
  } catch (error) {
    console.error("Database error:", error);
    throw new ApiError(500, "Error updating message");
  }
});

const getChannels = asyncHandler(async (req, res) => {
  const channels = await Channel.findAll({
    order: [["name", "ASC"]],
    raw: true,
  });

  if (!channels?.length) {
    throw new ApiError(404, "No channels found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channels, "Channels fetched successfully"));
});

export {
  getChannels,
  getMessages,
  createMessage,
  deleteMessage,
  updateMessage,
};
