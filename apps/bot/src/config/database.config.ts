import { registerAs } from "@nestjs/config";
import { env } from "node:process";

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
}

export const databaseConfig = registerAs<DatabaseConfig>("database", () => ({
  host: env.POSTGRES_HOST,
  port: +env.POSTGRES_PORT,
  database: env.POSTGRES_DB,
  username: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  ssl: env.DB_SSL === "true",
}));
