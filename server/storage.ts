import { db } from "./db";
import { wells, readings, users, type InsertWell, type Well, type InsertReading, type Reading, type InsertUser, type User } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Wells
  getWells(): Promise<Well[]>;
  getWell(id: number): Promise<Well | undefined>;
  createWell(well: InsertWell): Promise<Well>;
  
  // Readings
  getReadings(wellId: number): Promise<Reading[]>;
  createReading(reading: InsertReading): Promise<Reading>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getWells(): Promise<Well[]> {
    return await db.select().from(wells);
  }

  async getWell(id: number): Promise<Well | undefined> {
    const [well] = await db.select().from(wells).where(eq(wells.id, id));
    return well;
  }

  async createWell(insertWell: InsertWell): Promise<Well> {
    const [well] = await db.insert(wells).values(insertWell).returning();
    return well;
  }

  async getReadings(wellId: number): Promise<Reading[]> {
    return await db.select().from(readings).where(eq(readings.wellId, wellId)).orderBy(desc(readings.recordedAt));
  }

  async createReading(insertReading: InsertReading): Promise<Reading> {
    const [reading] = await db.insert(readings).values(insertReading).returning();
    
    // Determine new status
    const salinity = parseFloat(reading.salinity);
    let status = 'safe';
    if (salinity > 3) {
      status = 'danger';
    } else if (salinity >= 1) {
      status = 'warning';
    }

    // Update the well with new status and currentSalinity
    await db.update(wells)
      .set({ currentSalinity: reading.salinity, status })
      .where(eq(wells.id, reading.wellId));
      
    return reading;
  }
}

export const storage = new DatabaseStorage();
