import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { FineReportSchedulerService } from "./fine-report.scheduler.service";
import { MessageQueueModule, ReportModule, WorkFromHomeModule, TrackerModule } from "#src/integrations";
import { RoleMezonModule } from "#src/modules";

@Module({
  imports: [ConfigModule, MessageQueueModule, ReportModule, WorkFromHomeModule, TrackerModule, RoleMezonModule],
  providers: [FineReportSchedulerService],
  exports: [FineReportSchedulerService],
})
export class SchedulerModule {}
