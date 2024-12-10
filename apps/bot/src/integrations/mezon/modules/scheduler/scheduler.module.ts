import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { FineReportSchedulerService } from "./fine-report.scheduler.service";
import { MessageQueueModule, ExcelModule } from "#src/integrations";
import { RoleModule } from "#src/modules";

@Module({
  imports: [ConfigModule, forwardRef(() => MessageQueueModule), RoleModule, ExcelModule],
  providers: [FineReportSchedulerService],
  exports: [FineReportSchedulerService],
})
export class SchedulerModule {}
