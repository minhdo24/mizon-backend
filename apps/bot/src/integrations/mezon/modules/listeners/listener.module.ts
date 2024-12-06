import { Module, forwardRef } from "@nestjs/common";
import { ListenersService } from "./listeners.service";
import { MezonModule, Asterisk, MessageQueueModule } from "#src/integrations";

@Module({
  imports: [forwardRef(() => MezonModule), forwardRef(() => Asterisk), forwardRef(() => MessageQueueModule)],
  providers: [ListenersService],
  exports: [ListenersService],
})
export class ListenerModule {}
