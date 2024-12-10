import { Module } from "@nestjs/common";
import {
  AsteriskCommandModule,
  EventModule,
  ListenerModule,
  MessageQueueModule,
  ReportModule,
  SchedulerModule,
  StorageModule,
  ClientModule,
} from "./modules";

@Module({
  imports: [
    StorageModule,
    AsteriskCommandModule,
    EventModule,
    ListenerModule,
    MessageQueueModule,
    ReportModule,
    SchedulerModule,
    ClientModule,
  ],
  providers: [],
  exports: [],
})
export class MezonModule {}
