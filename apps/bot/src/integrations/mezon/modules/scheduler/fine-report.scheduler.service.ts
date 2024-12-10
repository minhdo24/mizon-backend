import { Injectable, Logger, forwardRef, Inject } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import moment from "moment";
import { MessageQueueService, MESSAGE_MODE, ExcelService } from "#src/integrations";
import { RoleService } from "#src/modules";
import { ConfigService } from "@nestjs/config";
import { Config } from "#src/config";
import { In } from "typeorm";
import { ChannelMessage } from "mezon-sdk";
import { replyMessageGenerate, type WrapperType } from "#src/utils";

@Injectable()
export class FineReportSchedulerService {
  private readonly logger = new Logger(FineReportSchedulerService.name);
  private readonly clandNccId = this.configService.getOrThrow("mezon.komubotrestClanNccId", { infer: true });

  private readonly mezonNhacuachungChannelId = this.configService.getOrThrow("mezon.mezonNhacuachungChannelId", {
    infer: true,
  });

  constructor(
    @Inject(forwardRef(() => MessageQueueService))
    private readonly messageQueueService: WrapperType<MessageQueueService>,

    private readonly configService: ConfigService<Config>,

    private readonly roleService: RoleService,

    private readonly excelService: ExcelService,
  ) {}

  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_8AM, {
    timeZone: "Asia/Ho_Chi_Minh",
  })
  async dailyReportScheduler() {
    const data = await this.excelService.reportSheet();

    const messageContent = `
    @STAFF @INTERN 
    Hi mn, link saodo ngày ${data.reportDate.format("DD/MM/YYYY")}. Mọi người lưu ý check kĩ các lỗi mình mắc phải, nếu cần complain thì gửi khiếu nại vào sheet saodo để được giải quyết nếu có lý do chính đáng.

    Link: ${data.sheetUrl}
    `
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      .trim();

    const roleTitles = ["STAFF", "INTERN"];
    const roles = await this.roleService.find({
      where: {
        clan_id: this.clandNccId,
        title: In(roleTitles),
      },
    });
    const staffRole = roles.find((role) => role.title === "STAFF");
    const internRole = roles.find((role) => role.title === "INTERN");

    const replyMessage = {
      clan_id: this.clandNccId,
      channel_id: this.mezonNhacuachungChannelId,
      is_public: false,
      is_parent_public: true,
      parent_id: "0",
      mode: MESSAGE_MODE.CHANNEL_MESSAGE,
      msg: {
        t: messageContent,
        lk: [
          {
            s: messageContent.length - data.sheetUrl.length,
            e: messageContent.length,
          },
        ],
      },
      mentions: [
        {
          role_id: staffRole?.id,
          s: 0,
          e: "@STAFF".length,
        },
        {
          role_id: internRole?.id,
          s: "@STAFF".length + 1,
          e: "@STAFF".length + 1 + "@INTERN".length,
        },
      ],
    };
    this.messageQueueService.addMessage(replyMessage);
  }

  async excuteReport(channelMessage: ChannelMessage, reportDate: moment.Moment, sheetId?: string) {
    if (reportDate.isSameOrAfter(moment(), "day")) {
      return replyMessageGenerate(
        {
          messageContent: `Report the day before today: ${moment().format("DD/MM/YYYY")}!`,
        },
        channelMessage,
        true,
      );
    }

    const dayOfWeek = moment(reportDate).isoWeekday();

    if (dayOfWeek > 5) {
      return replyMessageGenerate(
        {
          messageContent: `${reportDate.format("DD/MM/YYYY")} is not a working day!`,
        },
        channelMessage,
        true,
      );
    }

    const { sheetUrl } = await this.excelService.reportSheet(reportDate, sheetId);

    const messageContent = `
      File saodo đã được cập nhật

      Link: ${sheetUrl}
      `
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      .trim();

    const messageData = replyMessageGenerate(
      {
        messageContent,
        lk: [
          {
            s: messageContent.length - sheetUrl.length,
            e: messageContent.length,
          },
        ],
      },
      channelMessage,
      true,
    );

    return messageData;
  }
}
