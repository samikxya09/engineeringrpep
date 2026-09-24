const fs = require("fs");
const { Op } = require("sequelize");
const { parseCsvFile } = require("../utils/csvParser");
const { faculties, subjects, chapters, questions } = require("../database/connection");

/**
 * 1. Import Subjects from CSV
 * POST /api/import/subjects
 */
async function importSubjects(req, res) {
    if (!req.file) {
        return res.status(400).json({
            message: "No CSV file uploaded. Please upload a CSV file with field name 'file' or 'csv'.",
        });
    }

    const filePath = req.file.path;

    try {
        const aliasMap = {
            facultyId: ["facultyId", "facultyid", "faculty_id", "faculty id", "faculty"],
            name: ["name", "subjectName", "subject_name", "subject name", "title"],
            code: ["code", "subjectCode", "subject_code", "subject code"],
            description: ["description", "desc", "decription", "summary", "outline"],
        };

        const parsedRows = parseCsvFile(filePath, aliasMap);

        if (parsedRows.length === 0) {
            return res.status(400).json({
                message: "The uploaded CSV file is empty or contains only headers.",
            });
        }

        const imported = [];
        const skipped = [];
        const errors = [];

        // Preload all active faculties for efficient in-memory validation
        const facultyList = await faculties.findAll({ attributes: ["id", "name", "code"] });
        const facultyMap = new Map();
        facultyList.forEach((f) => {
            facultyMap.set(Number(f.id), f);
        });

        for (const row of parsedRows) {
            const rowNum = row._rowNumber;
            const facultyId = row.facultyId ? Number(row.facultyId) : null;
            const name = row.name ? row.name.trim() : "";
            const code = row.code ? row.code.trim() : null;
            const description = row.description ? row.description.trim() : null;

            // 1. Validation
            if (!facultyId || isNaN(facultyId)) {
                errors.push({
                    row: rowNum,
                    data: row,
                    error: "Invalid or missing facultyId. Faculty ID must be a number.",
                });
                continue;
            }

            if (!facultyMap.has(facultyId)) {
                errors.push({
                    row: rowNum,
                    data: row,
                    error: `Faculty ID ${facultyId} does not exist in the database.`,
                });
                continue;
            }

            if (!name) {
                errors.push({
                    row: rowNum,
                    data: row,
                    error: "Subject name is required.",
                });
                continue;
            }

            // 2. Check for duplicates under this faculty
            const duplicateConditions = [
                {
                    facultyId,
                    name: { [Op.iLike]: name },
                },
            ];

            if (code) {
                duplicateConditions.push({
                    facultyId,
                    code: { [Op.iLike]: code },
                });
            }

            const existingSubject = await subjects.findOne({
                where: {
                    [Op.or]: duplicateConditions,
                },
            });

            if (existingSubject) {
                skipped.push({
                    row: rowNum,
                    name,
                    code,
                    facultyId,
                    reason: `Subject already exists (ID: ${existingSubject.id}, Name: '${existingSubject.name}')`,
                });
                continue;
            }

            // 3. Create the subject
            const newSubject = await subjects.create({
                facultyId,
                name,
                code,
                description,
                isActive: true,
            });

            imported.push({
                row: rowNum,
                id: newSubject.id,
                name: newSubject.name,
                code: newSubject.code,
                facultyId: newSubject.facultyId,
            });
        }

        return res.status(200).json({
            message: `Subject CSV import completed. Imported: ${imported.length}, Skipped: ${skipped.length}, Errors: ${errors.length}`,
            totalRows: parsedRows.length,
            importedCount: imported.length,
            skippedCount: skipped.length,
            errorCount: errors.length,
            imported,
            skipped,
            errors,
        });
    } catch (error) {
        console.error("Error importing subjects from CSV:", error);
        return res.status(500).json({
            message: "Internal server error while importing subjects from CSV",
            error: error.message,
        });
    } finally {
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error("Error cleaning up CSV file:", err);
            }
        }
    }
}

/**
 * 2. Import Chapters from CSV
 * POST /api/import/chapters
 */
async function importChapters(req, res) {
    if (!req.file) {
        return res.status(400).json({
            message: "No CSV file uploaded. Please upload a CSV file with field name 'file' or 'csv'.",
        });
    }

    const filePath = req.file.path;

    try {
        const aliasMap = {
            subjectId: ["subjectId", "subjectid", "subject_id", "subject id", "subject"],
            chapterNumber: ["chapterNumber", "chapternumber", "chapter_number", "chapter number", "chapterno", "chapter_no", "no"],
            name: ["name", "chapterName", "chapter_name", "chapter name", "title"],
            description: ["description", "desc", "decription", "summary"],
        };

        const parsedRows = parseCsvFile(filePath, aliasMap);

        if (parsedRows.length === 0) {
            return res.status(400).json({
                message: "The uploaded CSV file is empty or contains only headers.",
            });
        }

        const imported = [];
        const skipped = [];
        const errors = [];

        // Preload subjects for fast in-memory validation
        const subjectList = await subjects.findAll({ attributes: ["id", "name", "facultyId"] });
        const subjectMap = new Map();
        subjectList.forEach((s) => {
            subjectMap.set(Number(s.id), s);
        });

        for (const row of parsedRows) {
            const rowNum = row._rowNumber;
            const subjectId = row.subjectId ? Number(row.subjectId) : null;
            const chapterNumber = row.chapterNumber && !isNaN(Number(row.chapterNumber)) ? Number(row.chapterNumber) : null;
            const name = row.name ? row.name.trim() : "";
            const description = row.description ? row.description.trim() : null;

            // 1. Validation
            if (!subjectId || isNaN(subjectId)) {
                errors.push({
                    row: rowNum,
                    data: row,
                    error: "Invalid or missing subjectId. Subject ID must be a number.",
                });
                continue;
            }

            if (!subjectMap.has(subjectId)) {
                errors.push({
                    row: rowNum,
                    data: row,
                    error: `Subject ID ${subjectId} does not exist in the database.`,
                });
                continue;
            }

            if (!name) {
                errors.push({
                    row: rowNum,
                    data: row,
                    error: "Chapter name is required.",
                });
                continue;
            }

            // 2. Check for duplicate chapter under this subject
            const duplicateConditions = [
                {
                    subjectId,
                    name: { [Op.iLike]: name },
                },
            ];

            if (chapterNumber !== null) {
                duplicateConditions.push({
                    subjectId,
                    chapterNumber,
                });
            }

            const existingChapter = await chapters.findOne({
                where: {
                    [Op.or]: duplicateConditions,
                },
            });

            if (existingChapter) {
                skipped.push({
                    row: rowNum,
                    name,
                    chapterNumber,
                    subjectId,
                    reason: `Chapter already exists under subject ${subjectId} (ID: ${existingChapter.id}, Name: '${existingChapter.name}')`,
                });
                continue;
            }

            // 3. Create chapter
            const newChapter = await chapters.create({
                subjectId,
                chapterNumber,
                name,
                description,
                isActive: true,
            });

            imported.push({
                row: rowNum,
                id: newChapter.id,
                name: newChapter.name,
                chapterNumber: newChapter.chapterNumber,
                subjectId: newChapter.subjectId,
            });
        }

        return res.status(200).json({
            message: `Chapter CSV import completed. Imported: ${imported.length}, Skipped: ${skipped.length}, Errors: ${errors.length}`,
            totalRows: parsedRows.length,
            importedCount: imported.length,
            skippedCount: skipped.length,
            errorCount: errors.length,
            imported,
            skipped,
            errors,
        });
    } catch (error) {
        console.error("Error importing chapters from CSV:", error);
        return res.status(500).json({
            message: "Internal server error while importing chapters from CSV",
            error: error.message,
        });
    } finally {
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error("Error cleaning up CSV file:", err);
            }
        }
    }
}

/**
 * 3. Import Questions from CSV
 * POST /api/import/questions
 */
async function importQuestions(req, res) {
    if (!req.file) {
        return res.status(400).json({
            message: "No CSV file uploaded. Please upload a CSV file with field name 'file' or 'csv'.",
        });
    }

    const filePath = req.file.path;

    try {
        const aliasMap = {
            chapterId: ["chapterId", "chapterid", "chapter_id", "chapter id", "chapter"],
            questionText: ["questionText", "questiontext", "question_text", "question text", "question", "statement", "problem"],
            optionA: ["optionA", "optiona", "option_a", "option a", "opta", "opt_a", "a"],
            optionB: ["optionB", "optionb", "option_b", "option b", "optb", "opt_b", "b"],
            optionC: ["optionC", "optionc", "option_c", "option c", "optc", "opt_c", "c"],
            optionD: ["optionD", "optiond", "option_d", "option d", "optd", "opt_d", "d"],
            correctAnswer: ["correctAnswer", "correctanswer", "correct_answer", "correct answer", "answer", "correct", "ans", "key"],
            explanation: ["explanation", "explain", "solution", "rationale", "notes"],
            difficulty: ["difficulty", "diff", "level"],
        };

        const parsedRows = parseCsvFile(filePath, aliasMap);

        if (parsedRows.length === 0) {
            return res.status(400).json({
                message: "The uploaded CSV file is empty or contains only headers.",
            });
        }

        const imported = [];
        const skipped = [];
        const errors = [];

        // Preload chapters for fast validation
        const chapterList = await chapters.findAll({ attributes: ["id", "name", "subjectId"] });
        const chapterMap = new Map();
        chapterList.forEach((c) => {
            chapterMap.set(Number(c.id), c);
        });

        for (const row of parsedRows) {
            const rowNum = row._rowNumber;
            const chapterId = row.chapterId ? Number(row.chapterId) : null;
            const questionText = row.questionText ? row.questionText.trim() : "";
            const optionA = row.optionA ? row.optionA.trim() : "";
            const optionB = row.optionB ? row.optionB.trim() : "";
            const optionC = row.optionC ? row.optionC.trim() : "";
            const optionD = row.optionD ? row.optionD.trim() : "";
            let correctAnswer = row.correctAnswer ? row.correctAnswer.trim().toUpperCase() : "";
            const explanation = row.explanation ? row.explanation.trim() : null;
            let difficulty = row.difficulty ? row.difficulty.trim().toLowerCase() : "medium";

            // 1. Validation
            if (!chapterId || isNaN(chapterId)) {
                errors.push({
                    row: rowNum,
                    data: row,
                    error: "Invalid or missing chapterId. Chapter ID must be a number.",
                });
                continue;
            }

            if (!chapterMap.has(chapterId)) {
                errors.push({
                    row: rowNum,
                    data: row,
                    error: `Chapter ID ${chapterId} does not exist in the database.`,
                });
                continue;
            }

            if (!questionText) {
                errors.push({
                    row: rowNum,
                    data: row,
                    error: "Question text is required.",
                });
                continue;
            }

            if (!optionA || !optionB || !optionC || !optionD) {
                errors.push({
                    row: rowNum,
                    data: row,
                    error: "All 4 options (optionA, optionB, optionC, optionD) are required.",
                });
                continue;
            }

            // Normalize and validate correctAnswer
            if (correctAnswer.startsWith("OPTION")) {
                correctAnswer = correctAnswer.replace("OPTION", "").trim();
            }
            if (!["A", "B", "C", "D"].includes(correctAnswer)) {
                errors.push({
                    row: rowNum,
                    data: row,
                    error: `Invalid correctAnswer '${row.correctAnswer}'. Must be 'A', 'B', 'C', or 'D'.`,
                });
                continue;
            }

            if (!["easy", "medium", "hard"].includes(difficulty)) {
                difficulty = "medium";
            }

            // 2. Check for duplicate question in this chapter
            const existingQuestion = await questions.findOne({
                where: {
                    chapterId,
                    questionText: { [Op.iLike]: questionText },
                },
            });

            if (existingQuestion) {
                skipped.push({
                    row: rowNum,
                    chapterId,
                    questionText: questionText.slice(0, 60) + "...",
                    reason: `Question already exists in chapter ${chapterId} (ID: ${existingQuestion.id})`,
                });
                continue;
            }

            // 3. Create question
            const newQuestion = await questions.create({
                chapterId,
                questionText,
                optionA,
                optionB,
                optionC,
                optionD,
                correctAnswer,
                explanation,
                difficulty,
                isActive: true,
            });

            imported.push({
                row: rowNum,
                id: newQuestion.id,
                chapterId: newQuestion.chapterId,
                questionText: newQuestion.questionText.slice(0, 50) + "...",
                correctAnswer: newQuestion.correctAnswer,
                difficulty: newQuestion.difficulty,
            });
        }

        return res.status(200).json({
            message: `Question CSV import completed. Imported: ${imported.length}, Skipped: ${skipped.length}, Errors: ${errors.length}`,
            totalRows: parsedRows.length,
            importedCount: imported.length,
            skippedCount: skipped.length,
            errorCount: errors.length,
            imported,
            skipped,
            errors,
        });
    } catch (error) {
        console.error("Error importing questions from CSV:", error);
        return res.status(500).json({
            message: "Internal server error while importing questions from CSV",
            error: error.message,
        });
    } finally {
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error("Error cleaning up CSV file:", err);
            }
        }
    }
}

module.exports = {
    importSubjects,
    importChapters,
    importQuestions,
};
