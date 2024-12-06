export * from "./command.abstract";
import { ApiMessageRef, ChannelMessage } from "mezon-sdk";
import { ReplyMezonMessage } from "#src/integrations";

// Abstract class CommandMessage with an abstract method 'execute'
// and a concrete method 'replyMessageGenerate'.
export abstract class CommandMessage {
  // Abstract method that needs to be implemented by subclasses
  abstract execute(args: string[], message: ChannelMessage, commandName?: string): any;

  // Concrete method to generate reply message with optional references
  replyMessageGenerate(
    replayContent: { [x: string]: any },
    message: ChannelMessage,
    hasRef: boolean = true,
    newRef?: ApiMessageRef[],
  ): ReplyMezonMessage {
    // This method calls the integration function for generating a reply message
    return ReplyMezonMessage.replyMessageGenerate(replayContent, message, hasRef, newRef);
  }
}
