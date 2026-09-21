const { DataTypes } = require("sequelize");

function studyMaterial(sequelize, DataTypes) {
    const StudyMaterial = sequelize.define("StudyMaterial", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        filePath: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fileName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fileSize: {
            type: DataTypes.INTEGER, // in bytes
            allowNull: true,
        },
        facultyId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "Faculties",
                key: "id",
            },
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
        },
        subjectId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Subjects",
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        chapterId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "Chapters",
                key: "id",
            },
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
        },
        uploadedBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Users",
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
    }, {
        timestamps: true,
    });

    return StudyMaterial;
}

module.exports = studyMaterial;
