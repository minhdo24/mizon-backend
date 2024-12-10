import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { extractMessage } from "#src/utils";
import { CommandStorage, ReportCommandService } from "#src/integrations";
import { ChannelMessage } from "mezon-sdk";
import { AsteriskInterface } from "./interfaces";
import { CommandMessage } from "./abstracts";

@Injectable()
export class Asterisk implements AsteriskInterface {
  commandList: { [key: string]: CommandMessage } = {};

  constructor(
    private readonly moduleRef: ModuleRef,
    @Inject(forwardRef(() => ReportCommandService))
    private readonly reportCommandService: ReportCommandService,
  ) {}

  execute(messageContent: string, message: ChannelMessage): any {
    const [commandName, args] = extractMessage(messageContent);
    const target = CommandStorage.getCommand(commandName);
    if (target) {
      if (target.name === "ReportCommandService") {
        return this.reportCommandService.execute(args, message);
      }
    }
  }
}
