import sequelize from "../config/connection.js";
import "../features/user/user.model.js";
import Post from "../feature/post/post.model.js";
import Appointment from "../features/appointment/appointment.model.js";
// Define associations
User.hasMany(Post, {
  foreignKey: "userId",
  as: "posts",
});

Post.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

const connectionDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    await sequelize.sync({
      alter: true,
    });

    console.log("Database synchronized successfully");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

export { connectionDB, sequelize };