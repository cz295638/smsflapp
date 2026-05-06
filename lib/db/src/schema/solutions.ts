import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const solutionsTable = pgTable("solutions", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull(),
  teacherId: integer("teacher_id").notNull(),
  drawingData: text("drawing_data").notNull(),
  audioData: text("audio_data"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSolutionSchema = createInsertSchema(solutionsTable).omit({ id: true, createdAt: true });
export type InsertSolution = z.infer<typeof insertSolutionSchema>;
export type Solution = typeof solutionsTable.$inferSelect;
