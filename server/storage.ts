import { users, gameScores, type User, type InsertUser, type GameScore, type InsertGameScore } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  saveGameScore(score: InsertGameScore): Promise<GameScore>;
  getHighScores(gameType?: string): Promise<GameScore[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async saveGameScore(insertScore: InsertGameScore): Promise<GameScore> {
    const [score] = await db
      .insert(gameScores)
      .values({
        ...insertScore,
        playerName: insertScore.playerName || null
      })
      .returning();
    return score;
  }

  async getHighScores(gameType?: string): Promise<GameScore[]> {
    if (gameType) {
      return await db.select()
        .from(gameScores)
        .where(eq(gameScores.gameType, gameType))
        .orderBy(desc(gameScores.score))
        .limit(10);
    }
    
    return await db.select()
      .from(gameScores)
      .orderBy(desc(gameScores.score))
      .limit(10);
  }
}

export const storage = new DatabaseStorage();
