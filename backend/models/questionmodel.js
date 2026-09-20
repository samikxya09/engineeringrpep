const { DataTypes } = require("sequelize");

function question(sequelize, DataTypes) {
    const Question = sequelize.define("Question", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        chapterId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Chapters",
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        questionText: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        optionA: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        optionB: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        optionC: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        optionD: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        correctAnswer: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [["A", "B", "C", "D", "a", "b", "c", "d"]],
            },
        },
        explanation: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        difficulty: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "medium",
            validate: {
                isIn: [["easy", "medium", "hard", "EASY", "MEDIUM", "HARD"]],
            },
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        timestamps: true,
    });

    return Question;
}

module.exports = question;
