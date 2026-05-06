import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { questionsTable, usersTable, solutionsTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { CreateQuestionBody, SubmitSolutionBody } from "@workspace/api-zod";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";

const router: IRouter = Router();

function formatQuestion(
  q: typeof questionsTable.$inferSelect,
  studentName: string,
  studentSchool: string,
) {
  return {
    id: q.id,
    studentId: q.studentId,
    subject: q.subject,
    photoData: q.photoData,
    status: q.status,
    teacherId: q.teacherId ?? null,
    createdAt: q.createdAt.toISOString(),
    studentName,
    studentSchool,
  };
}

router.get(
  "/questions",
  requireAuth,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    const user = req.user!;
    const { subject } = req.query as { subject?: string };

    let dbQuestions;
    if (user.role === "teacher") {
      const subjectFilter = subject || user.subject;
      if (subjectFilter) {
        dbQuestions = await db
          .select()
          .from(questionsTable)
          .where(eq(questionsTable.subject, subjectFilter))
          .orderBy(questionsTable.createdAt);
      } else {
        dbQuestions = await db
          .select()
          .from(questionsTable)
          .orderBy(questionsTable.createdAt);
      }
    } else {
      dbQuestions = await db
        .select()
        .from(questionsTable)
        .where(eq(questionsTable.studentId, user.id))
        .orderBy(questionsTable.createdAt);
    }

    if (dbQuestions.length === 0) {
      res.json([]);
      return;
    }

    const studentIds = [...new Set(dbQuestions.map((q) => q.studentId))];
    const students = await db
      .select()
      .from(usersTable)
      .where(inArray(usersTable.id, studentIds));

    const studentMap = new Map(students.map((s) => [s.id, s]));

    const result = dbQuestions.map((q) => {
      const student = studentMap.get(q.studentId);
      return formatQuestion(q, student?.name ?? "Bilinmeyen", student?.school ?? "");
    });

    res.json(result);
  },
);

router.post(
  "/questions",
  requireAuth,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    const parsed = CreateQuestionBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Geçersiz soru bilgileri" });
      return;
    }

    const user = req.user!;
    const [question] = await db
      .insert(questionsTable)
      .values({
        studentId: user.id,
        subject: parsed.data.subject,
        photoData: parsed.data.photoData,
        status: "pending",
        teacherId: parsed.data.preferredTeacherId ?? null,
        note: parsed.data.note ?? null,
      })
      .returning();

    res.status(201).json(formatQuestion(question, user.name, user.school));
  },
);

router.get(
  "/questions/:id",
  requireAuth,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(raw, 10);

    const [question] = await db
      .select()
      .from(questionsTable)
      .where(eq(questionsTable.id, id));

    if (!question) {
      res.status(404).json({ error: "Soru bulunamadı" });
      return;
    }

    const [student] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, question.studentId));

    const [solution] = await db
      .select()
      .from(solutionsTable)
      .where(eq(solutionsTable.questionId, id));

    let formattedSolution = null;
    if (solution) {
      const [teacher] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, solution.teacherId));

      formattedSolution = {
        id: solution.id,
        questionId: solution.questionId,
        teacherId: solution.teacherId,
        drawingData: solution.drawingData,
        audioData: solution.audioData ?? null,
        note: solution.note ?? null,
        createdAt: solution.createdAt.toISOString(),
        teacherName: teacher?.name ?? "Bilinmeyen",
      };
    }

    res.json({
      question: formatQuestion(
        question,
        student?.name ?? "Bilinmeyen",
        student?.school ?? "",
      ),
      solution: formattedSolution,
    });
  },
);

router.patch(
  "/questions/:id/claim",
  requireAuth,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(raw, 10);
    const user = req.user!;

    const [question] = await db
      .select()
      .from(questionsTable)
      .where(eq(questionsTable.id, id));

    if (!question) {
      res.status(404).json({ error: "Soru bulunamadı" });
      return;
    }

    const [updated] = await db
      .update(questionsTable)
      .set({ teacherId: user.id, status: "claimed" })
      .where(eq(questionsTable.id, id))
      .returning();

    const [student] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, updated.studentId));

    res.json(
      formatQuestion(updated, student?.name ?? "Bilinmeyen", student?.school ?? ""),
    );
  },
);

router.post(
  "/questions/:id/solution",
  requireAuth,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(raw, 10);
    const user = req.user!;

    const parsed = SubmitSolutionBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Geçersiz çözüm verisi" });
      return;
    }

    const [question] = await db
      .select()
      .from(questionsTable)
      .where(eq(questionsTable.id, id));

    if (!question) {
      res.status(404).json({ error: "Soru bulunamadı" });
      return;
    }

    await db
      .update(questionsTable)
      .set({ status: "solved" })
      .where(eq(questionsTable.id, id));

    const [solution] = await db
      .insert(solutionsTable)
      .values({
        questionId: id,
        teacherId: user.id,
        drawingData: parsed.data.drawingData,
        audioData: parsed.data.audioData ?? null,
        note: parsed.data.note ?? null,
      })
      .returning();

    const [student] = await db
      .select({ pushToken: usersTable.pushToken, name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.id, question.studentId));

    if (student?.pushToken) {
      fetch("https://exp.host/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          to: student.pushToken,
          title: "Sorunuz Çözüldü! 🎉",
          body: `${user.name} sorunuzu çözdü, hemen inceleyin.`,
          data: { questionId: id },
          sound: "default",
        }),
      }).catch(() => {});
    }

    res.status(201).json({
      id: solution.id,
      questionId: solution.questionId,
      teacherId: solution.teacherId,
      drawingData: solution.drawingData,
      audioData: solution.audioData ?? null,
      note: solution.note ?? null,
      createdAt: solution.createdAt.toISOString(),
      teacherName: user.name,
    });
  },
);

export default router;
