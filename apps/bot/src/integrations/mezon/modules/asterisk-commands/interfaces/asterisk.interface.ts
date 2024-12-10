import { ChannelMessage } from "mezon-sdk";
import { ReplyMezonMessage } from "#src/integrations";
export interface AsteriskInterface {
  execute: (
    messageContent: string,
    message: ChannelMessage,
    commandName?: string,
  ) => ReplyMezonMessage | null | ReplyMezonMessage[];
}
