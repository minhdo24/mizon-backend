import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { extractMessage } from "#src/utils";
import { CommandStorage } from "#src/integrations";
import { ChannelMessage } from "mezon-sdk";
import { AsteriskInterface } from "./interfaces";
import { CommandMessage } from "./abstracts";

@Injectable()
export class Asterisk implements AsteriskInterface {
  commandList: { [key: string]: CommandMessage } = {};

  constructor(private readonly moduleRef: ModuleRef) {}

  execute(messageContent: string, message: ChannelMessage): any {
    const [commandName, args] = extractMessage(messageContent);
    const target = CommandStorage.getCommand(commandName);
    if (target) {
      const command = this.moduleRef.get(target);
      if (command) {
        return command.execute(args, message);
      }
    }
  }
}
