const { Sequelize } = require("sequelize");
const {
    exams,
    examAttempts,
    examAnswers,
    questions,
    chapters,
    subjects,
    faculties,
    connection,
} = require("../database/connection");

/**
 * 1. Get All Exams (Student / Public)
 * GET /api/exams
 * Filters: ?type=mock&subjectId=1&facultyId=1
 */
async function getAllExams(req, res) {
    try {
        const { type, subjectId, facultyId } = req.query;
        const whereClause = { isActive: true };

        if (type) {
            whereClause.type = type.toLowerCase();
        }

        if (subjectId && !isNaN(Number(subjectId))) {
            whereClause.subjectId = Number(subjectId);
        }

        if (facultyId && !isNaN(Number(facultyId))) {
            whereClause.facultyId = Number(facultyId);
        }

        const examList = await exams.findAll({
            where: whereClause,
            attributes: [
                "id",
                "title",
                "type",
                "duration",
                "totalQuestions",
                "totalMarks",
                "passingMarks",
                "description",
                "facultyId",
                "subjectId",
                "createdAt",
            ],
            include: [
                {
                    model: faculties,
                    as: "faculty",
                    attributes: ["id", "name", "code"],
                },
                {
                    model: subjects,
                    as: "subject",
                    attributes: ["id", "name", "code"],
                },
            ],
            order: [["id", "DESC"]],
        });

        return res.status(200).json({
            message: "Exams fetched successfully",
            count: examList.length,
            exams: examList,
        });
    } catch (error) {
        console.error("Error fetching exams:", error);
        return res.status(500).json({
            message: "Internal server error while fetching exams",
            error: error.message,
        });
    }
}

/**
 * 2. Get Single Exam Details (Student / Public)
 * GET /api/exams/:id
 */
async function getExamById(req, res) {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                message: "Invalid exam ID. ID must be a valid number.",
            });
        }

        const exam = await exams.findOne({
            where: { id: Number(id), isActive: true },
            include: [
                {
                    model: faculties,
                    as: "faculty",
                    attributes: ["id", "name", "code"],
                },
                {
                    model: subjects,
                    as: "subject",
                    attributes: ["id", "name", "code"],
                },
            ],
        });

        if (!exam) {
            return res.status(404).json({
                message: `Exam with ID ${id} not found`,
            });
        }

        return res.status(200).json({
            message: "Exam details retrieved successfully",
            exam,
        });
    } catch (error) {
        console.error("Error fetching exam by ID:", error);
        return res.status(500).json({
            message: "Internal server error while fetching exam",
            error: error.message,
        });
    }
}

/**
 * 3. Start Exam (Student - Logged in)
 * POST /api/exams/:examId/start
 */
async function startExam(req, res) {
    try {
        const userId = req.user?.id;
        const { examId } = req.params;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: User must be logged in to start an exam",
            });
        }

        if (!examId || isNaN(Number(examId))) {
            return res.status(400).json({
                message: "Invalid exam ID",
            });
        }

        const exam = await exams.findByPk(Number(examId));
        if (!exam || !exam.isActive) {
            return res.status(404).json({
                message: `Active exam with ID ${examId} not found`,
            });
        }

        // Fetch questions for this exam
        let questionWhere = { isActive: true };
        let chapterInclude = {
            model: chapters,
            as: "chapter",
            attributes: ["id", "name", "subjectId"],
        };

        if (exam.subjectId) {
            chapterInclude.where = { subjectId: exam.subjectId };
        }

        const examQuestions = await questions.findAll({
            where: questionWhere,
            attributes: ["id", "questionText", "optionA", "optionB", "optionC", "optionD", "difficulty", "chapterId"],
            include: [chapterInclude],
            order: connection.random ? connection.random() : [Sequelize.literal("RANDOM()")],
            limit: exam.totalQuestions || 50,
        });

        if (!examQuestions || examQuestions.length === 0) {
            return res.status(400).json({
                message: "This exam currently does not have any questions available. Please contact an administrator.",
            });
        }

        // Create new ExamAttempt record
        const attempt = await examAttempts.create({
            userId: Number(userId),
            examId: exam.id,
            startTime: new Date(),
            totalQuestions: examQuestions.length,
            status: "started",
        });

        // Security: Ensure correct answers and explanations are NEVER exposed to the student
        const sanitizedQuestions = examQuestions.map(q => ({
            id: q.id,
            questionText: q.questionText,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            difficulty: q.difficulty,
            chapterId: q.chapterId,
        }));

        return res.status(201).json({
            message: "Exam started successfully",
            attemptId: attempt.id,
            exam: {
                id: exam.id,
                title: exam.title,
                type: exam.type,
                duration: exam.duration,
                totalQuestions: examQuestions.length,
                totalMarks: exam.totalMarks,
                passingMarks: exam.passingMarks,
            },
            duration: exam.duration,
            startTime: attempt.startTime,
            questions: sanitizedQuestions,
        });
    } catch (error) {
        console.error("Error starting exam:", error);
        return res.status(500).json({
            message: "Internal server error while starting exam",
            error: error.message,
        });
    }
}

/**
 * 4. Submit Exam (Student - Manual or Auto-Submit on Timer Expiry)
 * POST /api/exams/:attemptId/submit
 */
async function submitExam(req, res) {
    try {
        const userId = req.user?.id;
        const { attemptId } = req.params;
        const { answers = [] } = req.body;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: User must be logged in to submit an exam",
            });
        }

        if (!attemptId || isNaN(Number(attemptId))) {
            return res.status(400).json({
                message: "Invalid attempt ID",
            });
        }

        const attempt = await examAttempts.findByPk(Number(attemptId), {
            include: [{ model: exams, as: "exam" }],
        });

        if (!attempt) {
            return res.status(404).json({
                message: `Exam attempt with ID ${attemptId} not found`,
            });
        }

        // Verify attempt belongs to authenticated user
        if (attempt.userId !== Number(userId) && req.user?.role !== "admin") {
            return res.status(403).json({
                message: "Forbidden: You cannot submit an exam attempt belonging to another user",
            });
        }

        // Prevent duplicate submission
        if (attempt.status === "completed") {
            return res.status(200).json({
                message: "Exam was already submitted previously",
                attemptId: attempt.id,
                score: attempt.score,
                percentage: attempt.percentage,
                correctCount: attempt.correctCount,
                incorrectCount: attempt.incorrectCount,
                unansweredCount: attempt.unansweredCount,
                status: attempt.status,
            });
        }

        // Extract submitted question IDs
        const submittedAnswersMap = new Map();
        if (Array.isArray(answers)) {
            answers.forEach(ans => {
                if (ans.questionId) {
                    submittedAnswersMap.set(Number(ans.questionId), ans.selectedAnswer ? String(ans.selectedAnswer).trim().toUpperCase() : null);
                }
            });
        }

        // Retrieve official questions from database to verify correctness
        const questionIds = Array.from(submittedAnswersMap.keys());
        const officialQuestions = await questions.findAll({
            where: { id: questionIds },
            attributes: ["id", "correctAnswer"],
        });

        const officialMap = new Map();
        officialQuestions.forEach(q => {
            officialMap.set(q.id, q.correctAnswer.trim().toUpperCase());
        });

        let correctCount = 0;
        let incorrectCount = 0;
        let unansweredCount = 0;
        const answerRecords = [];

        // Grade each question submitted
        submittedAnswersMap.forEach((selectedAnswer, qId) => {
            const correctAnswer = officialMap.get(qId);
            let isCorrect = false;

            if (!selectedAnswer) {
                unansweredCount++;
            } else if (correctAnswer && selectedAnswer === correctAnswer) {
                isCorrect = true;
                correctCount++;
            } else {
                incorrectCount++;
            }

            answerRecords.push({
                attemptId: attempt.id,
                questionId: qId,
                selectedAnswer,
                isCorrect,
            });
        });

        // Save individual student answers
        if (answerRecords.length > 0) {
            await examAnswers.bulkCreate(answerRecords, { ignoreDuplicates: true });
        }

        const totalQuestions = attempt.totalQuestions || answerRecords.length || 1;
        const score = correctCount; // 1 mark per question
        const percentage = Math.round((correctCount / totalQuestions) * 100 * 100) / 100;
        const isPassed = attempt.exam ? score >= (attempt.exam.passingMarks || (totalQuestions / 2)) : percentage >= 50;

        // Update ExamAttempt
        attempt.status = "completed";
        attempt.endTime = new Date();
        attempt.correctCount = correctCount;
        attempt.incorrectCount = incorrectCount;
        attempt.unansweredCount = unansweredCount;
        attempt.score = score;
        attempt.percentage = percentage;

        await attempt.save();

        return res.status(200).json({
            message: "Exam submitted and evaluated successfully",
            attemptId: attempt.id,
            result: {
                totalQuestions,
                correctCount,
                incorrectCount,
                unansweredCount,
                score,
                percentage,
                isPassed,
                startTime: attempt.startTime,
                endTime: attempt.endTime,
                status: "completed",
            },
        });
    } catch (error) {
        console.error("Error submitting exam:", error);
        return res.status(500).json({
            message: "Internal server error while submitting exam",
            error: error.message,
        });
    }
}

/**
 * 5. Get Student Exam History
 * GET /api/exams/history
 */
async function getExamHistory(req, res) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: User not authenticated",
            });
        }

        const history = await examAttempts.findAll({
            where: { userId: Number(userId) },
            attributes: [
                "id",
                "examId",
                "startTime",
                "endTime",
                "totalQuestions",
                "correctCount",
                "score",
                "percentage",
                "status",
                "createdAt",
            ],
            include: [
                {
                    model: exams,
                    as: "exam",
                    attributes: ["id", "title", "type", "duration", "totalMarks", "passingMarks"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        const formattedHistory = history.map(item => ({
            attemptId: item.id,
            examId: item.examId,
            examTitle: item.exam?.title || "Exam",
            examType: item.exam?.type || "mock",
            date: item.createdAt,
            startTime: item.startTime,
            endTime: item.endTime,
            score: item.score,
            percentage: item.percentage,
            correctCount: item.correctCount,
            totalQuestions: item.totalQuestions,
            status: item.status,
        }));

        return res.status(200).json({
            message: "Exam history retrieved successfully",
            count: formattedHistory.length,
            history: formattedHistory,
        });
    } catch (error) {
        console.error("Error retrieving exam history:", error);
        return res.status(500).json({
            message: "Internal server error while retrieving exam history",
            error: error.message,
        });
    }
}

/**
 * 6. Create Exam (Admin Only)
 * POST /api/exams
 */
async function createExam(req, res) {
    try {
        const {
            title,
            type = "mock",
            facultyId,
            subjectId,
            duration = 60,
            totalQuestions = 50,
            totalMarks = 100,
            passingMarks = 50,
            description,
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Exam title is required",
            });
        }

        const newExam = await exams.create({
            title: title.trim(),
            type: type ? type.toLowerCase().trim() : "mock",
            facultyId: facultyId ? Number(facultyId) : null,
            subjectId: subjectId ? Number(subjectId) : null,
            duration: Number(duration) || 60,
            totalQuestions: Number(totalQuestions) || 50,
            totalMarks: Number(totalMarks) || 100,
            passingMarks: Number(passingMarks) || 50,
            description: description ? description.trim() : null,
            isActive: true,
        });

        const createdExam = await exams.findByPk(newExam.id, {
            include: [
                { model: faculties, as: "faculty", attributes: ["id", "name"] },
                { model: subjects, as: "subject", attributes: ["id", "name"] },
            ],
        });

        return res.status(201).json({
            message: "Exam created successfully",
            exam: createdExam,
        });
    } catch (error) {
        console.error("Error creating exam:", error);
        return res.status(500).json({
            message: "Internal server error while creating exam",
            error: error.message,
        });
    }
}

/**
 * 7. Update Exam (Admin Only)
 * PUT /api/exams/:id
 */
async function updateExam(req, res) {
    try {
        const { id } = req.params;
        const {
            title,
            type,
            facultyId,
            subjectId,
            duration,
            totalQuestions,
            totalMarks,
            passingMarks,
            description,
            isActive,
        } = req.body;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                message: "Invalid exam ID",
            });
        }

        const exam = await exams.findByPk(Number(id));
        if (!exam) {
            return res.status(404).json({
                message: `Exam with ID ${id} not found`,
            });
        }

        if (title !== undefined && title.trim()) exam.title = title.trim();
        if (type !== undefined) exam.type = type.toLowerCase().trim();
        if (facultyId !== undefined) exam.facultyId = facultyId ? Number(facultyId) : null;
        if (subjectId !== undefined) exam.subjectId = subjectId ? Number(subjectId) : null;
        if (duration !== undefined) exam.duration = Number(duration);
        if (totalQuestions !== undefined) exam.totalQuestions = Number(totalQuestions);
        if (totalMarks !== undefined) exam.totalMarks = Number(totalMarks);
        if (passingMarks !== undefined) exam.passingMarks = Number(passingMarks);
        if (description !== undefined) exam.description = description ? description.trim() : null;
        if (isActive !== undefined) exam.isActive = Boolean(isActive);

        await exam.save();

        const updatedExam = await exams.findByPk(exam.id, {
            include: [
                { model: faculties, as: "faculty", attributes: ["id", "name"] },
                { model: subjects, as: "subject", attributes: ["id", "name"] },
            ],
        });

        return res.status(200).json({
            message: "Exam updated successfully",
            exam: updatedExam,
        });
    } catch (error) {
        console.error("Error updating exam:", error);
        return res.status(500).json({
            message: "Internal server error while updating exam",
            error: error.message,
        });
    }
}

/**
 * 8. Delete Exam (Admin Only)
 * DELETE /api/exams/:id
 */
async function deleteExam(req, res) {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                message: "Invalid exam ID",
            });
        }

        const exam = await exams.findByPk(Number(id));
        if (!exam) {
            return res.status(404).json({
                message: `Exam with ID ${id} not found`,
            });
        }

        await exam.destroy();

        return res.status(200).json({
            message: `Exam '${exam.title}' (ID: ${id}) deleted successfully`,
        });
    } catch (error) {
        console.error("Error deleting exam:", error);
        return res.status(500).json({
            message: "Internal server error while deleting exam",
            error: error.message,
        });
    }
}

module.exports = {
    getAllExams,
    getExamById,
    startExam,
    submitExam,
    getExamHistory,
    createExam,
    updateExam,
    deleteExam,
};
