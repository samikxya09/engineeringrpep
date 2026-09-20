const { DataTypes } = require("sequelize");

function examAnswer(sequelize, DataTypes) {
    const ExamAnswer = sequelize.define("ExamAnswer", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        attemptId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "ExamAttempts",
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
        selectedAnswer: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isCorrect: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    }, {
        timestamps: true,
    });

    return ExamAnswer;
}

module.exports = examAnswer;
