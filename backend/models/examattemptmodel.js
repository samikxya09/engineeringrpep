const { DataTypes } = require("sequelize");

function examAttempt(sequelize, DataTypes) {
    const ExamAttempt = sequelize.define("ExamAttempt", {
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
        },
        examId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Exams",
                key: "id",
            },
            onDelete: "CASCADE",
        },
        startTime: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        endTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        totalQuestions: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        correctCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        incorrectCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        unansweredCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        score: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
        percentage: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
        status: {
            type: DataTypes.STRING, // "started", "completed"
            allowNull: false,
            defaultValue: "started",
            validate: {
                isIn: [["started", "completed", "STARTED", "COMPLETED"]],
            },
        },
    }, {
        timestamps: true,
    });

    return ExamAttempt;
}

module.exports = examAttempt;
