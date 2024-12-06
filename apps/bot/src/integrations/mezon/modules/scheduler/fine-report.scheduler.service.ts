import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import moment from "moment";
import {
  MessageQueueService,
  ReportDailyService,
  WorkFromHomeService,
  TrackerService,
  MESSAGE_MODE,
} from "#src/integrations";
import { RoleMezonService } from "#src/modules";
import { ConfigService } from "@nestjs/config";
import { Config } from "#src/config";
import { In } from "typeorm";
import { google } from "googleapis";

@Injectable()
export class FineReportSchedulerService {
  private readonly logger = new Logger(FineReportSchedulerService.name);
  private readonly clandNccId = this.configService.getOrThrow("mezon.komubotrestClanNccId");

  private readonly mezonNhacuachungChannelId = this.configService.getOrThrow("mezon.mezonNhacuachungChannelId");

  private readonly sheetId = this.configService.getOrThrow("sheet.sheetFineId");

  private readonly sheetClientId = this.configService.getOrThrow("sheet.sheetClientId");

  private readonly sheetClientSecret = this.configService.getOrThrow("sheet.sheetClientSecret");

  private readonly sheetRefreshToken = this.configService.getOrThrow("sheet.sheetRefreshToken");

  constructor(
    private readonly messageQueueService: MessageQueueService,
    private readonly reportDailyService: ReportDailyService,
    private readonly workFromHomeService: WorkFromHomeService,
    private readonly trackerService: TrackerService,
    private readonly configService: ConfigService<Config>,
    private readonly roleMezonService: RoleMezonService,
  ) {}

  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_8AM, {
    timeZone: "Asia/Ho_Chi_Minh",
  })
  async dailyReportScheduler() {
    const data = await this.calculateAndUpdateSheet();

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
    const roles = await this.roleMezonService.find({
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

  private async calculateAndUpdateSheet(reportDate?: moment.Moment, sheetId?: string) {
    try {
      const now = moment();

      if (!reportDate) {
        // reportDate = getPreviousWorkingDay(now);
      }

      if (!sheetId) {
        sheetId = this.sheetId;
      }

      const parsedDate = reportDate.startOf("day").toDate();
      const formatedDate = reportDate.format("DD/MM/YYYY");

      const [daily, mention, wfh, tracker] = await Promise.all([
        this.reportDailyService.getUserNotDaily(parsedDate),
        this.workFromHomeService.reportMachleo(parsedDate),
        this.workFromHomeService.reportWfh([, formatedDate], false),
        this.trackerService.reportTrackerNot([, formatedDate], false),
      ]);

      const notDaily = daily?.notDaily;

      const oauth2Client = new google.auth.OAuth2(this.sheetClientId, this.sheetClientSecret);
      oauth2Client.setCredentials({
        refresh_token: this.sheetRefreshToken,
      });

      const sheets = google.sheets({
        version: "v4",
        auth: oauth2Client,
      });

      const excelProcessor = new ExcelProcessor(reportDate, sheetId, sheets);
      await excelProcessor.initSheetData();

      handleDailyFine(notDaily, excelProcessor);
      handleMentionFine(mention, excelProcessor);
      handleWFHFine(wfh, excelProcessor);
      handleTrackerFine(tracker, excelProcessor);

      await excelProcessor.saveChange();

      return {
        reportDate,
        sheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}`,
      };
    } catch (error) {
      this.logger.error("calculateAndUpdateSheet_error", error);
      throw error;
    }
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

    const { sheetUrl } = await this.calculateAndUpdateSheet(reportDate, sheetId);

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
