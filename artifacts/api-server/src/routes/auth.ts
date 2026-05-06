import { Router, type IRouter } from "express";
import crypto from "crypto";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "sc_salt_2025").digest("hex");
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    school: user.school,
    subject: user.subject ?? null,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
  };
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Geçersiz kayıt bilgileri" });
    return;
  }

  const { name, email, password, role, school, subject } = parsed.data;

  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (existing) {
    res.status(400).json({ error: "Bu e-posta adresi zaten kayıtlı" });
    return;
  }

  const passwordHash = hashPassword(password);
  const token = generateToken();

  const [user] = await db
    .insert(usersTable)
    .values({
      name,
      email,
      passwordHash,
      role,
      school,
      subject: subject ?? null,
      status: "available",
      token,
    })
    .returning();

  res.status(201).json({ token, user: formatUser(user) });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Geçersiz giriş bilgileri" });
    return;
  }

  const { email, password } = parsed.data;
  const passwordHash = hashPassword(password);

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (!user || user.passwordHash !== passwordHash) {
    res.status(401).json({ error: "E-posta veya şifre hatalı" });
    return;
  }

  const token = generateToken();
  const [updated] = await db
    .update(usersTable)
    .set({ token })
    .where(eq(usersTable.id, user.id))
    .returning();

  res.json({ token, user: formatUser(updated) });
});

export default router;
