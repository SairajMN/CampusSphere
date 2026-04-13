import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const authRouter = Router();

authRouter.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const { passwordHash: _, ...safeUser } = user;

    res.cookie("userId", user.id, {
      httpOnly: true,
      signed: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "none",
      secure: true,
    });

    return res.json({ user: safeUser });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

authRouter.post("/auth/logout", (req, res) => {
  res.clearCookie("userId");
  return res.json({ ok: true });
});

authRouter.get("/auth/me", requireAuth, async (req, res) => {
  try {
    const userId = req.userId!;
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      res.clearCookie("userId");
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { passwordHash: _, ...safeUser } = user;
    return res.json({ user: safeUser });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default authRouter;
