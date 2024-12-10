import { registerAs } from "@nestjs/config";
import { env } from "process";

export interface TrackerConfig {
  baseUrl: string;
  komutrackerApiKeySecret: string;
}

export const trackerConfig = registerAs<TrackerConfig>("tracker", () => ({
  baseUrl: env.TRACKER_BASE_URL,
  komutrackerApiKeySecret: env.KOMUTRACKER_API_KEY_SECRET,
}));
