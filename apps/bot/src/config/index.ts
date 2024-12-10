import { type AppConfig } from "./app.config";
import { type DatabaseConfig } from "./database.config";
import { type MezonConfig } from "./mezon.config";
import { type SheetConfig } from "./sheet.config";
import { type TimeSheetConfig } from "./time-sheet.config";
import { type WorkFromHomeConfig } from "./work-from-home.config";
import { type TrackerConfig } from "./tracker.config";
export interface Config {
  app: AppConfig;

  database: DatabaseConfig;

  mezon: MezonConfig;

  sheet: SheetConfig;

  timeSheet: TimeSheetConfig;

  workFromHome: WorkFromHomeConfig;

  tracker: TrackerConfig;
}

export * from "./app.config";
export * from "./database.config";
export * from "./mezon.config";
export * from "./sheet.config";
export * from "./time-sheet.config";
export * from "./work-from-home.config";
export * from "./tracker.config";
