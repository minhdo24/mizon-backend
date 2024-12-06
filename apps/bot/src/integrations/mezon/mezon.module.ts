import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import {
  AsteriskCommandModule,
  EventModule,
  ListenerModule,
  MessageQueueModule,
  ReportModule,
  SchedulerModule,
  StorageModule,
} from "./modules";
import { MezonClientService } from "./mezon.service";

@Module({
  imports: [
    ConfigModule,
    AsteriskCommandModule,
    forwardRef(() => EventModule),
    forwardRef(() => ListenerModule),
    MessageQueueModule,
    ReportModule,
    SchedulerModule,
    StorageModule,
  ],
  providers: [MezonClientService],
  exports: [MezonClientService],
})
export class MezonModule {}
