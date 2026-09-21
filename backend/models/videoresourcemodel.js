const { DataTypes } = require("sequelize");

function videoResource(sequelize, DataTypes) {
    const VideoResource = sequelize.define("VideoResource", {
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
        videoUrl: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isUrl: true,
            },
        },
        platform: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "YouTube",
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
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "Users",
                key: "id",
            },
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
        },
    }, {
        timestamps: true,
    });

    return VideoResource;
}

module.exports = videoResource;
