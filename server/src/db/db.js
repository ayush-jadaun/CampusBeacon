import { Sequelize } from "sequelize";
import asyncHandler from "../utils/asyncHandler.js";
import dotenv from "dotenv";
dotenv.config();

// Database Connection using URI
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false, // Disable logging for cleaner output
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Supabase requires SSL
    },
  },
  pool: {
    max: 10,
    min: 1,
    acquire: 30000,
    idle: 10000,
  },
});

// // Sync Database
// sequelize
//   // .sync({alter:true})
//   .then(() => {
//     console.log("Database & tables have been updated!");
//   })
//   .catch((error) => {
//     console.error("Error updating database schema:", error);
//   });

// Connect to Database
export const connectDb = asyncHandler(async () => {
  await sequelize.authenticate();
  console.log("Database Connection has been established successfully.");
});

export default sequelize;
