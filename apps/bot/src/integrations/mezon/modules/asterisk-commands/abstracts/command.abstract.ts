export * from "./command.abstract";
import { ApiMessageRef, ChannelMessage } from "mezon-sdk";
import { replyMessageGenerate } from "#src/utils";
import { type ReplyMezonMessage } from "#src/integrations";

export abstract class CommandMessage {
  abstract execute(args: string[], message: ChannelMessage, commandName?: string): any;

  replyMessageGenerate(
    replayContent: { [x: string]: any },
    message: ChannelMessage,
    hasRef: boolean = true,
    newRef?: ApiMessageRef[],
  ): ReplyMezonMessage {
    return replyMessageGenerate(replayContent, message, hasRef, newRef);
  }
}
