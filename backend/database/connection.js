const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

const connection = new Sequelize(
    process.env.DB_NAME || "postgres",
    process.env.DB_USER || "postgres.wqodoagdpgvzidfgudni",
    process.env.DB_PASSWORD || "hello?pproject!",
    {
        host: process.env.DB_HOST || "aws-0-ap-northeast-1.pooler.supabase.com",
        port: process.env.DB_PORT || 6543,
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
        logging: false,
    }
);

connection
    .authenticate()
    .then(function () {
        console.log("Connected to database successfully");
    })
    .catch(function (error) {
        console.error("Database connection error:", error);
    });

const users = require("./../models/usermodel")(connection, DataTypes);

// Ensure tables are created or altered without dropping existing data
connection
    .sync({ alter: true, force: false })
    .then(function () {
        console.log("Database sync completed successfully");
    })
    .catch(function (error) {
        console.error("Database sync error:", error);
    });

module.exports = { connection, users };