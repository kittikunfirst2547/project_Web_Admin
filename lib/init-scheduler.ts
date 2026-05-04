/**
 * Backup Scheduler Initialization
 * 
 * This module handles starting the backup scheduler.
 * In production, you should use a proper cron job service like:
 * - Vercel Cron Jobs (if deploying to Vercel)
 * - AWS EventBridge
 * - Google Cloud Scheduler
 * - Self-hosted cron daemon
 * 
 * For local development, you can call the /api/admin/scheduler endpoint
 * periodically or use the manual trigger button in the admin panel.
 */

import { startBackupScheduler, stopBackupScheduler } from "./backup-scheduler";

let schedulerInterval: NodeJS.Timeout | null = null;
let isInitialized = false;

export function initBackupScheduler(): void {
  if (isInitialized) {
    console.log("[InitScheduler] Already initialized, skipping...");
    return;
  }

  // Check if we're in a server environment
  if (typeof window !== "undefined") {
    console.log("[InitScheduler] Skipping on client side");
    return;
  }

  try {
    schedulerInterval = startBackupScheduler();
    isInitialized = true;
    console.log("[InitScheduler] Backup scheduler started");
  } catch (error) {
    console.error("[InitScheduler] Failed to start scheduler:", error);
  }
}

export function shutdownBackupScheduler(): void {
  if (schedulerInterval) {
    stopBackupScheduler(schedulerInterval);
    schedulerInterval = null;
    isInitialized = false;
    console.log("[InitScheduler] Backup scheduler stopped");
  }
}

// Auto-initialize in production environments
if (process.env.NODE_ENV === "production" && typeof window === "undefined") {
  initBackupScheduler();
}
