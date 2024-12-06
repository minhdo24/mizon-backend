import { registerAs } from "@nestjs/config";
import { env } from "node:process";

export interface AppConfig {
  port: number;
}

export const appConfig = registerAs<AppConfig>("app", () => ({
  port: +env.PORT,
}));
