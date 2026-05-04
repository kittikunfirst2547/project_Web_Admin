import { prisma } from "@/lib/prisma";

type LogLevel = "info" | "warn" | "error";

interface LogOptions {
  userId?: string;
  action: string;
  details?: string;
  level?: LogLevel;
  path?: string;
}

export async function createLog(options: LogOptions) {
  try {
    await prisma.log.create({
      data: {
        userId: options.userId,
        action: options.action,
        details: options.details,
        level: options.level || "info",
        path: options.path,
      },
    });
  } catch (error) {
    console.error("[LOGGER_ERROR] Failed to create log:", error);
  }
}

// Helper functions for common actions
export async function logLogin(userId: string, email: string) {
  await createLog({
    userId,
    action: "USER_LOGIN",
    details: `User ${email} logged in`,
    level: "info",
    path: "/api/auth/callback/credentials",
  });
}

export async function logRegister(userId: string, email: string) {
  await createLog({
    userId,
    action: "USER_REGISTER",
    details: `New user registered: ${email}`,
    level: "info",
    path: "/api/auth/register",
  });
}

export async function logReading(userId: string | null, clientName: string, type: string) {
  await createLog({
    userId: userId || undefined,
    action: "USER_READING",
    details: `Reading for ${clientName} (${type})`,
    level: "info",
    path: "/api/reading",
  });
}

export async function logOrder(userId: string, productName: string, amount: number) {
  await createLog({
    userId,
    action: "USER_ORDER",
    details: `Ordered ${productName} for ${amount} THB`,
    level: "info",
    path: "/api/orders",
  });
}

export async function logLogout(userId: string) {
  await createLog({
    userId,
    action: "USER_LOGOUT",
    details: "User logged out",
    level: "info",
    path: "/api/auth/signout",
  });
}

export async function logProfileUpdate(userId: string, changes: string) {
  await createLog({
    userId,
    action: "PROFILE_UPDATE",
    details: `Profile updated: ${changes}`,
    level: "info",
    path: "/api/user/profile",
  });
}
