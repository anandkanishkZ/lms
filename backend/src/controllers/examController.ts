import { Request, Response } from 'express';
import { PrismaClient, QuestionType, ExamStatus } from '@prisma/client';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

// ============================================
// EXAM MANAGEMENT (Teacher/Admin)
// ============================================

/**
 * Create a new exam
 * POST /api/v1/exams
 */
export const createExam = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      subjectId,
      classId,
      batchId,
      type,
      startTime,
      endTime,
      duration,
      totalMarks,
      passingMarks,
      instructions,
      allowLateSubmission,
      shuffleQuestions,
      showResultsImmediately,
      allowReview,
      maxAttempts,
      questions, // Array of questions with options
    } = req.body;

    const userId = req.user!.userId;

    // Validate dates
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time',
      });
    }

    // Create exam with questions
    const exam = await prisma.exam.create({
      data: {
        title,
        description,
        subjectId,
        classId,
        batchId,
        type,
        status: ExamStatus.UPCOMING,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration,
        totalMarks,
        passingMarks,
        instructions,
        allowLateSubmission: allowLateSubmission || false,
        shuffleQuestions: shuffleQuestions || false,
        showResultsImmediately: showResultsImmediately || false,
        allowReview: allowReview !== undefined ? allowReview : true,
        maxAttempts: maxAttempts || 1,
        createdBy: userId,
      },
      include: {
        subject: true,
        class: true,
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // If questions are provided, create them
    if (questions && Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        
        // Create question
        const question = await prisma.question.create({
          data: {
            questionText: q.questionText,
            questionTextHtml: q.questionTextHtml,
            questionType: q.questionType,
            marks: q.marks || 0,
            negativeMarks: q.negativeMarks || 0,
            allowMultipleFiles: q.allowMultipleFiles !== undefined ? q.allowMultipleFiles : true,
            maxFiles: q.maxFiles || 5,
            acceptedFileTypes: q.acceptedFileTypes,
            maxFileSizeMB: q.maxFileSizeMB || 10,
            explanation: q.explanation,
            explanationHtml: q.explanationHtml,
            difficulty: q.difficulty,
            tags: q.tags || [],
            createdBy: userId,
          },
        });

        // Create options for MCQ questions
        if (q.questionType === QuestionType.MULTIPLE_CHOICE && q.options) {
          for (let j = 0; j < q.options.length; j++) {
            const opt = q.options[j];
            await prisma.questionOption.create({
              data: {
                questionId: question.id,
                optionText: opt.optionText,
                optionTextHtml: opt.optionTextHtml,
                isCorrect: opt.isCorrect || false,
                orderIndex: j,
              },
            });
          }
        }

        // Link question to exam
        await prisma.examQuestion.create({
          data: {
            examId: exam.id,
            questionId: question.id,
            orderIndex: i,
            marks: q.marks,
            isOptional: q.isOptional || false,
            sectionName: q.sectionName,
          },
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      data: exam,
    });
  } catch (error: any) {
    console.error('Error creating exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create exam',
      error: error.message,
    });
  }
};

/**
 * Get all exams (with filters)
 * GET /api/v1/exams
 */
export const getAllExams = async (req: AuthRequest, res: Response) => {
  try {
    const { subjectId, classId, status, type } = req.query;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const where: any = {};

    // Filters
    if (subjectId) where.subjectId = subjectId as string;
    if (classId) where.classId = classId as string;
    if (status) where.status = status as ExamStatus;
    if (type) where.type = type;

    // Teachers see only their exams, students see all relevant exams
    if (userRole === 'TEACHER') {
      where.createdBy = userId;
    }

    const exams = await prisma.exam.findMany({
      where,
      include: {
        subject: true,
        class: true,
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    res.json({
      success: true,
      data: exams,
    });
  } catch (error: any) {
    console.error('Error fetching exams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exams',
      error: error.message,
    });
  }
};

/**
 * Get single exam by ID
 * GET /api/v1/exams/:id
 */
export const getExamById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        subject: true,
        class: true,
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        questions: {
          include: {
            question: {
              include: {
                options: {
                  orderBy: {
                    orderIndex: 'asc',
                  },
                },
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
        _count: {
          select: {
            attempts: true,
          },
        },
      },
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    // Check if student has an incomplete attempt (for resuming)
    let studentAttempt = null;
    if (userRole === 'STUDENT') {
      studentAttempt = await prisma.studentExamAttempt.findFirst({
        where: {
          examId: id,
          studentId: userId,
          isCompleted: false, // Only return incomplete attempts
        },
        include: {
          answers: {
            include: {
              question: true,
              selectedOption: true,
            },
          },
        },
      });
    }

    res.json({
      success: true,
      data: {
        ...exam,
        studentAttempt,
      },
    });
  } catch (error: any) {
    console.error('Error fetching exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam',
      error: error.message,
    });
  }
};

/**
 * Update exam
 * PUT /api/v1/exams/:id
 */
export const updateExam = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // Check if exam exists and user has permission
    const existingExam = await prisma.exam.findUnique({
      where: { id },
    });

    if (!existingExam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    if (userRole === 'TEACHER' && existingExam.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this exam',
      });
    }

    const {
      title,
      description,
      startTime,
      endTime,
      duration,
      totalMarks,
      passingMarks,
      instructions,
      status,
      allowLateSubmission,
      shuffleQuestions,
      showResultsImmediately,
      allowReview,
      maxAttempts,
    } = req.body;

    const exam = await prisma.exam.update({
      where: { id },
      data: {
        title,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        duration,
        totalMarks,
        passingMarks,
        instructions,
        status,
        allowLateSubmission,
        shuffleQuestions,
        showResultsImmediately,
        allowReview,
        maxAttempts,
      },
      include: {
        subject: true,
        class: true,
        questions: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Exam updated successfully',
      data: exam,
    });
  } catch (error: any) {
    console.error('Error updating exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update exam',
      error: error.message,
    });
  }
};

/**
 * Delete exam
 * DELETE /api/v1/exams/:id
 */
export const deleteExam = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const exam = await prisma.exam.findUnique({
      where: { id },
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    if (userRole === 'TEACHER' && exam.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this exam',
      });
    }

    await prisma.exam.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Exam deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete exam',
      error: error.message,
    });
  }
};

// ============================================
// QUESTION MANAGEMENT
// ============================================

/**
 * Add question to exam
 * POST /api/v1/exams/:id/questions
 */
export const addQuestionToExam = async (req: AuthRequest, res: Response) => {
  try {
    const { id: examId } = req.params;
    const userId = req.user!.userId;
    const {
      questionText,
      questionTextHtml,
      questionType,
      marks,
      negativeMarks,
      allowMultipleFiles,
      maxFiles,
      acceptedFileTypes,
      maxFileSizeMB,
      explanation,
      explanationHtml,
      difficulty,
      tags,
      options,
      orderIndex,
      isOptional,
      sectionName,
    } = req.body;

    // Check if exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    // Create question
    const question = await prisma.question.create({
      data: {
        questionText,
        questionTextHtml,
        questionType,
        marks: marks || 0,
        negativeMarks: negativeMarks || 0,
        allowMultipleFiles: allowMultipleFiles !== undefined ? allowMultipleFiles : true,
        maxFiles: maxFiles || 5,
        acceptedFileTypes,
        maxFileSizeMB: maxFileSizeMB || 10,
        explanation,
        explanationHtml,
        difficulty,
        tags: tags || [],
        createdBy: userId,
      },
    });

    // Create options for MCQ
    if (questionType === QuestionType.MULTIPLE_CHOICE && options) {
      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        await prisma.questionOption.create({
          data: {
            questionId: question.id,
            optionText: opt.optionText,
            optionTextHtml: opt.optionTextHtml,
            isCorrect: opt.isCorrect || false,
            orderIndex: i,
          },
        });
      }
    }

    // Link question to exam
    const examQuestion = await prisma.examQuestion.create({
      data: {
        examId,
        questionId: question.id,
        orderIndex: orderIndex !== undefined ? orderIndex : 999,
        marks,
        isOptional: isOptional || false,
        sectionName,
      },
      include: {
        question: {
          include: {
            options: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Question added to exam successfully',
      data: examQuestion,
    });
  } catch (error: any) {
    console.error('Error adding question to exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add question to exam',
      error: error.message,
    });
  }
};

/**
 * Update question in exam
 * PUT /api/v1/exams/:examId/questions/:questionId
 */
export const updateQuestionInExam = async (req: AuthRequest, res: Response) => {
  try {
    const { examId, questionId } = req.params;
    const {
      questionText,
      questionTextHtml,
      marks,
      negativeMarks,
      explanation,
      explanationHtml,
      options,
    } = req.body;

    // Update question
    const question = await prisma.question.update({
      where: { id: questionId },
      data: {
        questionText,
        questionTextHtml,
        marks,
        negativeMarks,
        explanation,
        explanationHtml,
      },
    });

    // Update options if provided
    if (options && Array.isArray(options)) {
      // Delete existing options
      await prisma.questionOption.deleteMany({
        where: { questionId },
      });

      // Create new options
      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        await prisma.questionOption.create({
          data: {
            questionId,
            optionText: opt.optionText,
            optionTextHtml: opt.optionTextHtml,
            isCorrect: opt.isCorrect || false,
            orderIndex: i,
          },
        });
      }
    }

    const updatedQuestion = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        options: true,
      },
    });

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: updatedQuestion,
    });
  } catch (error: any) {
    console.error('Error updating question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update question',
      error: error.message,
    });
  }
};

/**
 * Remove question from exam
 * DELETE /api/v1/exams/:examId/questions/:questionId
 */
export const removeQuestionFromExam = async (req: AuthRequest, res: Response) => {
  try {
    const { examId, questionId } = req.params;

    // Remove the link (will cascade delete the question)
    await prisma.examQuestion.deleteMany({
      where: {
        examId,
        questionId,
      },
    });

    res.json({
      success: true,
      message: 'Question removed from exam successfully',
    });
  } catch (error: any) {
    console.error('Error removing question from exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove question from exam',
      error: error.message,
    });
  }
};

// ============================================
// STUDENT EXAM TAKING
// ============================================

/**
 * Start exam attempt
 * POST /api/v1/exams/:id/start
 */
export const startExamAttempt = async (req: AuthRequest, res: Response) => {
  try {
    const { id: examId } = req.params;
    const studentId = req.user!.userId;
    const { ipAddress, userAgent, deviceInfo } = req.body;

    // Get exam
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    // Check if exam is active
    const now = new Date();
    if (now < exam.startTime) {
      return res.status(400).json({
        success: false,
        message: 'Exam has not started yet',
      });
    }

    if (now > exam.endTime) {
      return res.status(400).json({
        success: false,
        message: 'Exam has ended',
      });
    }

    // First, check if there's an incomplete attempt (highest priority)
    const incompleteAttempt = await prisma.studentExamAttempt.findFirst({
      where: {
        examId,
        studentId,
        isCompleted: false,
      },
      include: {
        answers: {
          include: {
            question: true,
            selectedOption: true,
          },
        },
      },
    });

    if (incompleteAttempt) {
      return res.json({
        success: true,
        message: 'Resuming existing attempt',
        data: {
          attempt: incompleteAttempt,
          exam,
        },
      });
    }

    // Check completed attempts count
    const completedAttempts = await prisma.studentExamAttempt.count({
      where: {
        examId,
        studentId,
        isCompleted: true,
      },
    });

    if (completedAttempts >= exam.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: `Maximum attempts (${exam.maxAttempts}) reached`,
      });
    }

    // Create new attempt
    const attempt = await prisma.studentExamAttempt.create({
      data: {
        examId,
        studentId,
        attemptNumber: completedAttempts + 1,
        ipAddress,
        userAgent,
        deviceInfo,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Exam attempt started successfully',
      data: {
        attempt,
        exam,
      },
    });
  } catch (error: any) {
    console.error('Error starting exam attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start exam attempt',
      error: error.message,
    });
  }
};

/**
 * Submit answer for a question
 * POST /api/v1/exams/:examId/attempts/:attemptId/answer
 */
export const submitAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const { examId, attemptId } = req.params;
    const studentId = req.user!.userId;
    const {
      questionId,
      selectedOptionId,
      textAnswer,
    } = req.body;

    // Handle uploaded files
    const uploadedFiles = req.files
      ? (req.files as Express.Multer.File[]).map((file) => `/uploads/exam-answers/${file.filename}`)
      : [];

    // Verify attempt belongs to student
    const attempt = await prisma.studentExamAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt || attempt.studentId !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Invalid attempt',
      });
    }

    if (attempt.isCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Exam attempt already completed',
      });
    }

    // Get question
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        options: true,
      },
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    // Check if answer already exists
    const existingAnswer = await prisma.studentAnswer.findUnique({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
    });

    let answer;
    if (existingAnswer) {
      // Update existing answer
      answer = await prisma.studentAnswer.update({
        where: { id: existingAnswer.id },
        data: {
          selectedOptionId,
          textAnswer,
          uploadedFiles: uploadedFiles.length > 0 ? uploadedFiles : existingAnswer.uploadedFiles,
        },
      });
    } else {
      // Create new answer
      answer = await prisma.studentAnswer.create({
        data: {
          attemptId,
          questionId,
          selectedOptionId,
          textAnswer,
          uploadedFiles: uploadedFiles.length > 0 ? uploadedFiles : [],
        },
      });
    }

    // Auto-grade MCQ if applicable
    if (question.questionType === QuestionType.MULTIPLE_CHOICE && selectedOptionId) {
      const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
      if (selectedOption) {
        await prisma.studentAnswer.update({
          where: { id: answer.id },
          data: {
            isCorrect: selectedOption.isCorrect,
            marksAwarded: selectedOption.isCorrect ? question.marks : 0,
          },
        });
      }
    }

    res.json({
      success: true,
      message: 'Answer saved successfully',
      data: answer,
    });
  } catch (error: any) {
    console.error('Error submitting answer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit answer',
      error: error.message,
    });
  }
};

/**
 * Submit exam attempt
 * POST /api/v1/exams/:examId/attempts/:attemptId/submit
 */
export const submitExamAttempt = async (req: AuthRequest, res: Response) => {
  try {
    const { examId, attemptId } = req.params;
    const studentId = req.user!.userId;

    // Verify attempt
    const attempt = await prisma.studentExamAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: true,
        answers: {
          include: {
            question: true,
            selectedOption: true,
          },
        },
      },
    });

    if (!attempt || attempt.studentId !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Invalid attempt',
      });
    }

    if (attempt.isCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Exam attempt already submitted',
      });
    }

    // Check if late submission
    const now = new Date();
    const isLate = now > attempt.exam.endTime;

    if (isLate && !attempt.exam.allowLateSubmission) {
      return res.status(400).json({
        success: false,
        message: 'Late submission not allowed',
      });
    }

    // Calculate time spent
    const timeSpentSeconds = Math.floor((now.getTime() - attempt.startedAt.getTime()) / 1000);

    // Calculate total score (only for auto-graded questions)
    let totalScore = 0;
    let maxScore = 0;

    for (const answer of attempt.answers) {
      maxScore += answer.question.marks;
      if (answer.isCorrect !== null && answer.marksAwarded !== null) {
        totalScore += answer.marksAwarded;
      }
    }

    // Check if all questions are graded
    const allGraded = attempt.answers.every(a => a.marksAwarded !== null);

    // Update attempt
    const updatedAttempt = await prisma.studentExamAttempt.update({
      where: { id: attemptId },
      data: {
        isCompleted: true,
        submittedAt: now,
        isLate,
        timeSpentSeconds,
        totalScore: allGraded ? totalScore : null,
        maxScore: allGraded ? maxScore : null,
        percentage: allGraded && maxScore > 0 ? (totalScore / maxScore) * 100 : null,
        isGraded: allGraded,
      },
      include: {
        answers: {
          include: {
            question: true,
            selectedOption: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Exam submitted successfully',
      data: updatedAttempt,
    });
  } catch (error: any) {
    console.error('Error submitting exam attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit exam attempt',
      error: error.message,
    });
  }
};

// ============================================
// GRADING (Teacher/Admin)
// ============================================

/**
 * Get attempts for grading
 * GET /api/v1/exams/:id/attempts
 */
export const getExamAttempts = async (req: AuthRequest, res: Response) => {
  try {
    const { id: examId } = req.params;

    const attempts = await prisma.studentExamAttempt.findMany({
      where: {
        examId,
        isCompleted: true,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            symbolNo: true,
          },
        },
        answers: {
          include: {
            question: true,
            selectedOption: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: attempts,
    });
  } catch (error: any) {
    console.error('Error fetching exam attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam attempts',
      error: error.message,
    });
  }
};

/**
 * Grade an answer
 * PUT /api/v1/exams/answers/:answerId/grade
 */
export const gradeAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const { answerId } = req.params;
    const { marksAwarded, feedback, isCorrect } = req.body;
    const gradedBy = req.user!.userId;

    // Validate marks awarded
    if (marksAwarded === null || marksAwarded === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Marks awarded is required',
      });
    }

    if (typeof marksAwarded !== 'number' || marksAwarded < 0) {
      return res.status(400).json({
        success: false,
        message: 'Marks awarded must be a non-negative number',
      });
    }

    // Get the answer with question details to validate marks
    const existingAnswer = await prisma.studentAnswer.findUnique({
      where: { id: answerId },
      include: {
        question: true,
      },
    });

    if (!existingAnswer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found',
      });
    }

    // Validate marks don't exceed question marks
    if (marksAwarded > existingAnswer.question.marks) {
      return res.status(400).json({
        success: false,
        message: `Marks awarded cannot exceed question marks (${existingAnswer.question.marks})`,
      });
    }

    const answer = await prisma.studentAnswer.update({
      where: { id: answerId },
      data: {
        marksAwarded,
        feedback,
        isCorrect,
      },
    });

    // Check if all answers in the attempt are graded
    const attempt = await prisma.studentExamAttempt.findUnique({
      where: { id: answer.attemptId },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (attempt) {
      const allGraded = attempt.answers.every(a => a.marksAwarded !== null);

      if (allGraded) {
        // Calculate total score
        const totalScore = attempt.answers.reduce((sum, a) => sum + (a.marksAwarded || 0), 0);
        const maxScore = attempt.answers.reduce((sum, a) => sum + a.question.marks, 0);

        await prisma.studentExamAttempt.update({
          where: { id: attempt.id },
          data: {
            isGraded: true,
            gradedAt: new Date(),
            gradedBy,
            totalScore,
            maxScore,
            percentage: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
          },
        });
      }
    }

    res.json({
      success: true,
      message: 'Answer graded successfully',
      data: answer,
    });
  } catch (error: any) {
    console.error('Error grading answer:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to grade answer',
      error: error.message,
    });
  }
};

/**
 * Get student's exam results
 * GET /api/v1/exams/:id/my-result
 */
export const getMyExamResult = async (req: AuthRequest, res: Response) => {
  try {
    const { id: examId } = req.params;
    const studentId = req.user!.userId;

    const attempt = await prisma.studentExamAttempt.findFirst({
      where: {
        examId,
        studentId,
        isCompleted: true,
      },
      include: {
        exam: true,
        answers: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
            selectedOption: true,
          },
        },
      },
      orderBy: {
        attemptNumber: 'desc',
      },
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'No completed attempt found',
      });
    }

    res.json({
      success: true,
      data: attempt,
    });
  } catch (error: any) {
    console.error('Error fetching exam result:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam result',
      error: error.message,
    });
  }
};

/**
 * Get exam preview (for students before starting)
 * GET /api/v1/exams/:id/preview
 */
export const getExamPreview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const exam = await prisma.exam.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        instructions: true,
        type: true,
        status: true,
        startTime: true,
        endTime: true,
        duration: true,
        totalMarks: true,
        passingMarks: true,
        allowLateSubmission: true,
        shuffleQuestions: true,
        showResultsImmediately: true,
        allowReview: true,
        maxAttempts: true,
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            section: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        questions: {
          select: {
            id: true,
            marks: true,
            question: {
              select: {
                id: true,
                questionType: true,
              },
            },
          },
        },
      },
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    // Check if student has already attempted this exam
    let attemptCount = 0;
    let canAttempt = true;
    if (userRole === 'STUDENT') {
      attemptCount = await prisma.studentExamAttempt.count({
        where: {
          examId: id,
          studentId: userId,
          isCompleted: true,
        },
      });
      
      if (exam.maxAttempts && attemptCount >= exam.maxAttempts) {
        canAttempt = false;
      }
    }

    // Count questions by type
    const questionTypes: Record<string, number> = {};
    exam.questions.forEach((q) => {
      const type = q.question.questionType;
      questionTypes[type] = (questionTypes[type] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        instructions: exam.instructions,
        type: exam.type,
        status: exam.status,
        startTime: exam.startTime,
        endTime: exam.endTime,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        allowLateSubmission: exam.allowLateSubmission,
        shuffleQuestions: exam.shuffleQuestions,
        showResultsImmediately: exam.showResultsImmediately,
        allowReview: exam.allowReview,
        maxAttempts: exam.maxAttempts,
        subject: exam.subject,
        class: exam.class,
        createdByUser: exam.createdByUser,
        questionCount: exam.questions.length,
        questionTypes,
        attemptCount,
        canAttempt,
      },
    });
  } catch (error: any) {
    console.error('Error fetching exam preview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam preview',
      error: error.message,
    });
  }
};

export default {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
  addQuestionToExam,
  updateQuestionInExam,
  removeQuestionFromExam,
  startExamAttempt,
  submitAnswer,
  submitExamAttempt,
  getExamAttempts,
  gradeAnswer,
  getMyExamResult,
  getExamPreview,
};