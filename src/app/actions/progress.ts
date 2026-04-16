"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function syncReadingProgress(chapterId: string, position: number = 0) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false };
    const userId = session.user.id;

    await prisma.readingProgress.upsert({
      where: { userId_chapterId: { userId, chapterId } },
      update: { position },
      create: { userId, chapterId, position },
    });

    // ── Streak tracking ──────────────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true, longestStreak: true, lastReadDate: true },
    });

    if (user) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastDate = user.lastReadDate ? new Date(user.lastReadDate) : null;
      if (lastDate) lastDate.setHours(0, 0, 0, 0);

      const diffDays = lastDate
        ? Math.round((today.getTime() - lastDate.getTime()) / 86_400_000)
        : null;

      let newStreak = user.currentStreak;
      if (diffDays === null || diffDays > 1) newStreak = 1;          // first read or gap
      else if (diffDays === 1) newStreak = user.currentStreak + 1;   // consecutive day
      // diffDays === 0 → same day, streak unchanged

      const newLongest = Math.max(user.longestStreak, newStreak);

      await prisma.user.update({
        where: { id: userId },
        data: {
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastReadDate: today,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to sync progress:", error);
    return { success: false };
  }
}

export async function getReadingProgress(chapterId: string): Promise<number | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    const progress = await prisma.readingProgress.findUnique({
      where: { userId_chapterId: { userId: session.user.id, chapterId } },
      select: { position: true },
    });

    return progress?.position ?? null;
  } catch {
    return null;
  }
}
