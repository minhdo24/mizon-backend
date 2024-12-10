"use strict";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TimeSheetService } from "./time-sheet.service";
import { AxiosModule } from "#src/integrations";

@Module({
  imports: [ConfigModule, AxiosModule],
  providers: [TimeSheetService],
  exports: [TimeSheetService],
})
export class TimeSheetModule {}
