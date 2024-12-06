import { registerAs } from "@nestjs/config";
import { env } from "process";

export interface SheetConfig {
  sheetClientId: string;
  sheetClientSecret: string;
  sheetRedirectURI: string;
  sheetRefreshToken: string;
  sheetFineId: string;
}

export const sheetConfig = registerAs<SheetConfig>("sheet", () => ({
  sheetClientId: env.SHEET_CLIENT_ID,
  sheetClientSecret: env.SHEET_CLIENT_SECRET,
  sheetRedirectURI: env.SHEET_REDIRECT_URI,
  sheetRefreshToken: env.SHEET_REFRESH_TOKEN,
  sheetFineId: env.SHEET_FINE_ID,
}));
