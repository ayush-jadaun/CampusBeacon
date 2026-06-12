import { DataTypes } from "sequelize";
import sequelize from "../db/db.js";

const LostAndFound = sequelize.define(
  "LostAndFound",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    item_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location_found: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    date_found: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    owner_contact: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "lost", // 'lost' (owner searching) or 'found' (finder reporting)
    },
  },
  {
    timestamps: true,
  }
);

export default LostAndFound;
