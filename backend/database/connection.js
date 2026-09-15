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

connection
    .sync({ alter: false, force: false })
    .then(function () {
        console.log("Migration completed successfully");
    })
    .catch(function (error) {
        console.error("Migration error:", error);
    });

module.exports = { connection, users };