const { DataTypes } = require("sequelize");

function user(sequelize, DataTypes) {
    const User = sequelize.define("User", {
        id: {

            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true

        },


        name: {

            type: DataTypes.STRING,
            allowNull: false

        },


        email: {

            type: DataTypes.STRING,
            allowNull: false,
            unique: true

        },


        password: {

            type: DataTypes.STRING,
            allowNull: false

        }


    });

    return User;
}

module.exports = user;