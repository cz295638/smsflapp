import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateMyStatusBody, UpdateMyAvatarBody } from "@workspace/api-zod";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";

const router: IRouter = Router();

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    school: user.school,
    subject: user.subject ?? null,
    status: user.status,
    avatarData: user.avatarData ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

router.get(
  "/users/me",
  requireAuth,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    res.json(formatUser(req.user!));
  },
);

router.patch(
  "/users/me/avatar",
  requireAuth,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    const parsed = UpdateMyAvatarBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Geçersiz fotoğraf verisi" });
      return;
    }

    const [updated] = await db
      .update(usersTable)
      .set({ avatarData: parsed.data.avatarData })
      .where(eq(usersTable.id, req.user!.id))
      .returning();

    res.json(formatUser(updated));
  },
);

router.patch(
  "/users/me/status",
  requireAuth,
  async (req: AuthenticatedRequest, res): Promise<void> => {
    const parsed = UpdateMyStatusBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Geçersiz durum değeri" });
      return;
    }

    const [updated] = await db
      .update(usersTable)
      .set({ status: parsed.data.status })
      .where(eq(usersTable.id, req.user!.id))
      .returning();

    res.json(formatUser(updated));
  },
);

export default router;
