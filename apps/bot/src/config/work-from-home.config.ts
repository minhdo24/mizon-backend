import { registerAs } from "@nestjs/config";
import { env } from "process";

export interface WorkFromHomeConfig {
  wfhApiKeySecret: string;
}

export const workFromHomeConfig = registerAs<WorkFromHomeConfig>("workFromHome", () => ({
  wfhApiKeySecret: env.WFH_API_KEY_SECRET,
}));
