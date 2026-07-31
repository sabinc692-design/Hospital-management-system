import dotenv from "dotenv";
dotenv.config();

import { Sequelize } from "sequelize";

const dbConnection = process.env.DATABASE_URL;

const sequelize = new Sequelize(dbConnection, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: false,
      rejectUnauthorized: false,
    },
  },
  logging:console.log,
});

console.log("Registered Models:", Object.keys(sequelize.models));

const connectionDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(" Database connected successfully");

    await sequelize.sync({
  alter: true,
});

    console.log(" Database synchronized successfully");
  } catch (error) {
    console.error(" Database connection failed:", error);
    process.exit(1);
  }
};

export { connectionDB };
export default sequelize;