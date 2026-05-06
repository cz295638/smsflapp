import { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export interface AuthenticatedRequest extends Request {
  user?: typeof usersTable.$inferSelect;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Yetkisiz erişim" });
    return;
  }

  const token = authHeader.substring(7);
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.token, token));

  if (!user) {
    res.status(401).json({ error: "Geçersiz oturum" });
    return;
  }

  req.user = user;
  next();
}
