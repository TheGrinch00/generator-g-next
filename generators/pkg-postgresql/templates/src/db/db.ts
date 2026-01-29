if (process.env.FORCE_LOAD_ENV_DB === "true") {
  require("custom-env").env("local");
  require("custom-env");
}

import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import * as schema from "./schema";

import ws from "ws";
neonConfig.webSocketConstructor = ws;

// Usa direttamente il pool, senza chiamare .connect()
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.on("error", (err: any) => {
  console.error("Database pool error:", err);
});

// Passa direttamente il pool a drizzle (senza client.connect())
export const db = drizzle(pool, { schema });
