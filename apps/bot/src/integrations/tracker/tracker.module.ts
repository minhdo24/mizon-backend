"use strict";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TrackerService } from "./tracker.service";
import { AxiosModule, TimeSheetModule } from "#src/integrations";

@Module({
  imports: [ConfigModule, AxiosModule, TimeSheetModule],
  providers: [TrackerService],
  exports: [TrackerService],
})
export class TrackerModule {}
