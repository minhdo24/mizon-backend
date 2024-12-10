import { Module, forwardRef } from "@nestjs/common";
import { ListenersService } from "./listeners.service";
import { ClientModule, AsteriskCommandModule, MessageQueueModule } from "#src/integrations";

@Module({
  imports: [
    forwardRef(() => ClientModule),
    forwardRef(() => AsteriskCommandModule),
    forwardRef(() => MessageQueueModule),
  ],
  providers: [ListenersService],
  exports: [ListenersService],
})
export class ListenerModule {}
