import sequelize from "../db/db.js";
import { DataTypes } from "sequelize";

export const EventRegistration = sequelize.define(
  "event_registrations",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    event_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "events",
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["event_id", "user_id"],
      },
    ],
  }
);

export default EventRegistration;
