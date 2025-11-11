import { createServer } from "http";
import type { Express } from "express";

export async function registerRoutes(app: Express) {
  const server = createServer(app);
  return server;
}
