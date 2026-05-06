import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.get(
  "/teachers",
  requireAuth,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    const { subject, school } = req.query as {
      subject?: string;
      school?: string;
    };

    const conditions = [eq(usersTable.role, "teacher")];
    if (subject) conditions.push(eq(usersTable.subject, subject));
    if (school) conditions.push(eq(usersTable.school, school));

    const teachers = await db
      .select()
      .from(usersTable)
      .where(and(...conditions));

    res.json(
      teachers.map((t) => ({
        id: t.id,
        name: t.name,
        school: t.school,
        subject: t.subject ?? "",
        status: t.status,
      })),
    );
  },
);

export default router;
