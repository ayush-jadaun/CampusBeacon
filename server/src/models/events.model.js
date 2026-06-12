import sequelize from "../db/db.js";
import { DataTypes } from "sequelize";

export const Event = sequelize.define(
  "events",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    social_media_links: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    club_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "clubs",
        key: "id",
      },
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    videos: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    max_participants: {
      type: DataTypes.INTEGER,
      allowNull: true, // null = unlimited
    },
  },
  {
    timestamps: true,
  }
);
