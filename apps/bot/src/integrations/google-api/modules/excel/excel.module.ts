"use strict";
import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ExcelService } from "./excel.service";
import { GoogleApiModule } from "../../google-api.module";

@Module({
  imports: [ConfigModule, forwardRef(() => GoogleApiModule)],
  providers: [ExcelService],
  exports: [ExcelService],
})
export class ExcelModule {}
