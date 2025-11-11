import type { Express } from "express";
import type { Server } from "http";

export function log(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

export async function setupVite(_app: Express, _server: Server) {
  // Development mode - currently handled directly in server/index.ts
  log("Vite setup handled via dev server redirect");
}

export function serveStatic(_app: Express) {
  // For production, implement static serving if needed
  log("Static serving is not configured in this stub");
}
