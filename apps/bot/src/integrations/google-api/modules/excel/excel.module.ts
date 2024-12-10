"use strict";
import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ExcelService } from "./excel.service";
import { GoogleApiModule } from "../../google-api.module";
import { TrackerModule, WorkFromHomeModule, ReportModule } from "#src/integrations";

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => GoogleApiModule),
    forwardRef(() => TrackerModule),
    forwardRef(() => WorkFromHomeModule),
    forwardRef(() => ReportModule),
  ],
  providers: [ExcelService],
  exports: [ExcelService],
})
export class ExcelModule {}
