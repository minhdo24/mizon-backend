import { Module, forwardRef } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ConfigModule } from "@nestjs/config";
import { BotGateway } from "./event.service";
import { MezonModule } from "#src/integrations";

@Module({
  imports: [ConfigModule, forwardRef(() => MezonModule), EventEmitterModule.forRoot()],
  providers: [BotGateway],
  exports: [BotGateway],
})
export class EventModule {}
