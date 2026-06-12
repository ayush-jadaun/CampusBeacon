import { DataTypes } from "sequelize";
import sequelize from "../db/db.js"

const BuyAndSell = sequelize.define("BuyAndSell", {
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
  date_bought: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  owner_contact: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  price:{
    type:DataTypes.INTEGER,
    allowNull:false
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  userId:{
    type:DataTypes.INTEGER,
    allowNull:false,
  },
  item_condition: {
    type: DataTypes.ENUM("Good", "Fair", "Poor","New","Like New","Fair"),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  is_sold: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  }
}, {
  timestamps: true
});

export default BuyAndSell;
