// models/user.js
export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255), // store hashed password
        allowNull: false,
      },
    },
    {
      tableName: "users", // table name in DB
      timestamps: true,   // adds createdAt & updatedAt
    }
  );

  return User;
};
