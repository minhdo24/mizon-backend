import { Injectable, forwardRef, Inject } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Events } from "mezon-sdk";
import type { ChannelMessage, MezonClient } from "mezon-sdk";
import { ClientService, Asterisk, MessageQueueService } from "#src/integrations";
import { type WrapperType } from "#src/utils";

@Injectable()
export class ListenersService {
  private client: MezonClient;

  constructor(
    @Inject(forwardRef(() => ClientService))
    private readonly clientService: WrapperType<ClientService>,

    @Inject(forwardRef(() => Asterisk))
    private readonly asteriskCommand: WrapperType<Asterisk>,

    @Inject(forwardRef(() => MessageQueueService))
    private readonly messageQueueService: WrapperType<MessageQueueService>,
  ) {
    this.client = clientService.getClient();
  }

  @OnEvent(Events.ChannelMessage)
  async handleCommand(msg: ChannelMessage): Promise<void> {
    if (msg.code) return;

    try {
      const content = msg.content.t;
      let replyMessage;

      if (typeof content === "string" && content.trim()) {
        const firstLetter = content.trim()[0];

        switch (firstLetter) {
          case "*":
            replyMessage = await this.asteriskCommand.execute(content, msg);
            break;
          default:
            return;
        }

        if (replyMessage) {
          const replyMessageArray = Array.isArray(replyMessage) ? replyMessage : [replyMessage];
          for (const mess of replyMessageArray) {
            this.messageQueueService.addMessage({ ...mess, sender_id: msg.sender_id });
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
}
