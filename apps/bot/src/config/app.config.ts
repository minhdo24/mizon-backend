import { registerAs } from "@nestjs/config";
import { env } from "node:process";

export const appConfig = registerAs<AppConfig>("app", () => ({
  port: +env.PORT,

  version: env.APP_VERSION,
}));

export interface AppConfig {
  port: number;

  version: string;
}
