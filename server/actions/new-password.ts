"use server";

import { NewPasswordSchema } from "@/app/type/new-password-schema";
import { createSafeActionClient } from "next-safe-action";
import { getPasswordResetTokenByToken } from "./tokens";
import { db } from "..";
import { eq } from "drizzle-orm";
import { passwordResetTokens, users } from "../schema";
import bcrypt from "bcrypt";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
const action = createSafeActionClient();
export const newPassword = action(
  NewPasswordSchema,
  async ({ password, token }) => {
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL! });
    const dbpool = drizzle(pool);
    //check the token
    if (!token) return { error: "Token is required" };
    //check if the token valid or not
    const existingToken = await getPasswordResetTokenByToken(token);
    if (!existingToken) return { error: "Token is invalid" };
    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) return { error: "Token has expired" };
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, existingToken.email),
    });
    if (!existingUser) return { error: "User not found" };
    const hashedPassword = await bcrypt.hash(password, 10);
    await dbpool.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, existingUser.id));
      await tx
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.id, existingToken.id));
    });
    return { success: "password changed successfully!" };
  }
);
