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

// Initialize Models
const users = require("./../models/usermodel")(connection, DataTypes);
const faculties = require("./../models/facultymodel")(connection, DataTypes);
const subjects = require("./../models/subjectmodel")(connection, DataTypes);
const chapters = require("./../models/chaptermodel")(connection, DataTypes);
const questions = require("./../models/questionmodel")(connection, DataTypes);
const exams = require("./../models/exammodel")(connection, DataTypes);
const examAttempts = require("./../models/examattemptmodel")(connection, DataTypes);
const examAnswers = require("./../models/examanswermodel")(connection, DataTypes);

// Define Relationships
faculties.hasMany(subjects, { foreignKey: "facultyId", as: "subjects", onDelete: "CASCADE" });
subjects.belongsTo(faculties, { foreignKey: "facultyId", as: "faculty", onDelete: "CASCADE" });

subjects.hasMany(chapters, { foreignKey: "subjectId", as: "chapters", onDelete: "CASCADE" });
chapters.belongsTo(subjects, { foreignKey: "subjectId", as: "subject", onDelete: "CASCADE" });

chapters.hasMany(questions, { foreignKey: "chapterId", as: "questions", onDelete: "CASCADE" });
questions.belongsTo(chapters, { foreignKey: "chapterId", as: "chapter", onDelete: "CASCADE" });

// Exam Associations
faculties.hasMany(exams, { foreignKey: "facultyId", as: "exams", onDelete: "SET NULL" });
exams.belongsTo(faculties, { foreignKey: "facultyId", as: "faculty", onDelete: "SET NULL" });

subjects.hasMany(exams, { foreignKey: "subjectId", as: "exams", onDelete: "SET NULL" });
exams.belongsTo(subjects, { foreignKey: "subjectId", as: "subject", onDelete: "SET NULL" });

users.hasMany(examAttempts, { foreignKey: "userId", as: "examAttempts", onDelete: "CASCADE" });
examAttemptUserAssociation = examAttempts.belongsTo(users, { foreignKey: "userId", as: "user", onDelete: "CASCADE" });

exams.hasMany(examAttempts, { foreignKey: "examId", as: "attempts", onDelete: "CASCADE" });
examAttempts.belongsTo(exams, { foreignKey: "examId", as: "exam", onDelete: "CASCADE" });

examAttempts.hasMany(examAnswers, { foreignKey: "attemptId", as: "answers", onDelete: "CASCADE" });
examAnswers.belongsTo(examAttempts, { foreignKey: "attemptId", as: "attempt", onDelete: "CASCADE" });

questions.hasMany(examAnswers, { foreignKey: "questionId", as: "answers", onDelete: "CASCADE" });
examAnswers.belongsTo(questions, { foreignKey: "questionId", as: "question", onDelete: "CASCADE" });

// Ensure tables are created or altered without dropping existing data
connection
    .sync({ alter: true, force: false })
    .then(function () {
        console.log("Database sync completed successfully");
    })
    .catch(function (error) {
        console.error("Database sync error:", error);
    });

module.exports = {
    connection,
    users,
    faculties,
    subjects,
    chapters,
    questions,
    exams,
    examAttempts,
    examAnswers,
};