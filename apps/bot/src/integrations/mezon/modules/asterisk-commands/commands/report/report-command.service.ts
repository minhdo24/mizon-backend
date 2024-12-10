/* eslint-disable no-case-declarations */
import { Command } from "#src/integrations/mezon/decorators";
import moment from "moment";
import { FineReportSchedulerService } from "#src/integrations";
import { CommandMessage } from "../../abstracts";
import { ChannelMessage } from "mezon-sdk";
import { forwardRef, Inject } from "@nestjs/common";
import { type WrapperType } from "#src/utils";

@Command("report")
export class ReportCommandService extends CommandMessage {
  constructor(
    @Inject(forwardRef(() => FineReportSchedulerService))
    private readonly fineReportSchedulerService: WrapperType<FineReportSchedulerService>,
  ) {
    super();
  }

  async execute(args: any[], message: ChannelMessage) {
    const firstArg = args[0];
    switch (firstArg) {
      case "saodo":
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const validUserId = ["1800396411926220800", "1820647107783036928", "1783444920736944128"];
        if (args[1]) {
          if (
            !/^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|(([1][26]|[2468][048]|[3579][26])00))))$/.test(
              args[1],
            )
          ) {
            const messageContent = "```" + "*report fine dd/MM/YYYY sheet-id(optional)" + "```";
            return this.replyMessageGenerate(
              {
                messageContent,
                mk: [
                  {
                    type: "t",
                    s: 0,
                    e: messageContent.length,
                  },
                ],
              },
              message,
            );
          }
          const reportDate = moment(args[1], "DD/MM/YYYY");
          const sheetId = args[2];
          return this.fineReportSchedulerService.excuteReport(message, reportDate, sheetId);
        }
        const messageContent = "```" + "*report fine dd/MM/YYYY sheet-id(optional)" + "```";
        return this.replyMessageGenerate(
          {
            messageContent,
            mk: [
              {
                type: "t",
                s: 0,
                e: messageContent.length,
              },
            ],
          },
          message,
        );
      default:
        break;
    }
  }
}
