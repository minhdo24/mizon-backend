import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SchedulerModule } from "#src/integrations";
import { ReportCommandService } from "./report-command.service";

@Module({
  imports: [ConfigModule, SchedulerModule],
  providers: [ReportCommandService],
  exports: [ReportCommandService],
})
export class ReportCommandModule {}
