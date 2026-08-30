import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === TABLE DEFINITIONS ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default('staff'), // 'admin', 'staff'
  createdAt: timestamp("created_at").defaultNow(),
});

export const wells = pgTable("wells", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  province: text("province"), // PNG province name (e.g. "Manus", "Bougainville")
  status: text("status").notNull().default('safe'), // 'safe', 'warning', 'danger'
  currentSalinity: numeric("current_salinity").notNull().default('0'), // parts per thousand (ppt)
  createdAt: timestamp("created_at").defaultNow(),
});

export const readings = pgTable("readings", {
  id: serial("id").primaryKey(),
  wellId: integer("well_id").notNull(),
  salinity: numeric("salinity").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

// === RELATIONS ===
export const wellsRelations = relations(wells, ({ many }) => ({
  readings: many(readings),
}));

export const readingsRelations = relations(readings, ({ one }) => ({
  well: one(wells, {
    fields: [readings.wellId],
    references: [wells.id],
  }),
}));

// === BASE SCHEMAS ===
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const insertWellSchema = createInsertSchema(wells).omit({ id: true, createdAt: true });
export const insertReadingSchema = createInsertSchema(readings).omit({ id: true, recordedAt: true });

// === EXPLICIT API CONTRACT TYPES ===
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type User = typeof users.$inferSelect;
export type SafeUser = Omit<User, 'password'>;

export type InsertWell = z.infer<typeof insertWellSchema>;
export type Well = typeof wells.$inferSelect;

export type InsertReading = z.infer<typeof insertReadingSchema>;
export type Reading = typeof readings.$inferSelect;

export type CreateWellRequest = InsertWell;
export type CreateReadingRequest = InsertReading;

export type WellResponse = Well;
export type WellsListResponse = Well[];

export type ReadingResponse = Reading;
export type ReadingsListResponse = Reading[];
