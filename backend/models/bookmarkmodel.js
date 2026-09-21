const { DataTypes } = require("sequelize");

function bookmark(sequelize, DataTypes) {
    const Bookmark = sequelize.define("Bookmark", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Users",
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        questionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Questions",
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
    }, {
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["userId", "questionId"],
                name: "unique_user_question_bookmark",
            },
        ],
    });

    return Bookmark;
}

module.exports = bookmark;
