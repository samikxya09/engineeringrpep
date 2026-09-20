const { DataTypes } = require("sequelize");

function exam(sequelize, DataTypes) {
    const Exam = sequelize.define("Exam", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "mock",
            validate: {
                isIn: [["practice", "mock", "previous_year", "PRACTICE", "MOCK", "PREVIOUS_YEAR"]],
            },
        },
        facultyId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "Faculties",
                key: "id",
            },
            onDelete: "SET NULL",
        },
        subjectId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "Subjects",
                key: "id",
            },
            onDelete: "SET NULL",
        },
        duration: {
            type: DataTypes.INTEGER, // duration in minutes
            allowNull: false,
            defaultValue: 60,
        },
        totalQuestions: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 50,
        },
        totalMarks: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 100,
        },
        passingMarks: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 50,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        timestamps: true,
    });

    return Exam;
}

module.exports = exam;
