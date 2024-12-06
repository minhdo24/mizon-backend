import { registerAs } from "@nestjs/config";
import { env } from "process";

export interface TimeSheetConfig {
  timeSheetApi: string;
  WFHApi: {
    apiURL: string;
  };
  AIApi: string;
  AIToken: string;
}

export const timeSheetConfig = registerAs<TimeSheetConfig>("timeSheet", () => ({
  timeSheetApi: env.TIMESHEET_API,
  WFHApi: {
    apiURL: `${env.TIMESHEET_API}Public/GetUserWorkFromHome`,
  },
  AIApi: env.AI_API,
  AIToken: env.AI_TOKEN,
}));
