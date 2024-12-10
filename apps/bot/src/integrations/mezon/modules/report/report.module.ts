import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ReportDailyService } from "./report-daily.service";
import { AxiosModule } from "#src/integrations";

@Module({
  imports: [ConfigModule, AxiosModule],
  providers: [ReportDailyService],
  exports: [ReportDailyService],
})
export class ReportModule {}
