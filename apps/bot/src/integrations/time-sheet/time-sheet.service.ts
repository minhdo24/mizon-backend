import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosService } from "#src/integrations";
import { Config } from "#src/config";
import { normalizeString, formatDayMonth, getUserNameByEmail } from "#src/integrations";
import * as chrono from "chrono-node";
import parseDuration from "parse-duration";
import https from "https";

@Injectable()
export class TimeSheetService {
  private readonly baseUrl = this.configService.getOrThrow("timeSheet.WFHApi.apiURL", { infer: true });
  private readonly wfhApiKeySecret = this.configService.getOrThrow("workFromHome.wfhApiKeySecret", { infer: true });
  private readonly httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  constructor(
    private readonly axiosService: AxiosService,
    private readonly configService: ConfigService<Config>,
  ) {}

  parseDailyMessage = (message: string) => {
    const [, metaRaw, yesterday, todayRaw, block] = message.split(/\*daily|[- ]?yesterday:|[- ]?today:|[- ]?block:/gi);
    const [projectRaw, dateRaw] = metaRaw.trim().split(/\s+/);
    const dateStr = dateRaw ? normalizeString(dateRaw) : normalizeString(projectRaw);
    const projectCode = dateRaw ? normalizeString(projectRaw) : null;
    const todayStr = normalizeString(todayRaw);
    const date = chrono.parseDate(dateStr);
    const tasks = this.parseTimeSheetSentence(todayStr);
    return {
      date: dateStr,
      projectCode,
      timeStamp: date,
      yesterday: normalizeString(yesterday),
      today: todayStr,
      block: normalizeString(block),
      tasks,
    };
  };

  logTimeSheetFromDaily = async ({ content, emailAddress }: { content: string; emailAddress: string }) => {
    const data = this.parseDailyMessage(content);
    const { projectCode } = data;
    const results = [];
    for (const task of data.tasks) {
      const response = await this.logTimeSheetForTask({
        projectCode,
        task,
        emailAddress,
      });
      const result = response.data;
      results.push(result);
    }
  };

  async findWFHUser(timestamp: number = Date.now()): Promise<any[]> {
    const url = `${this.baseUrl}?date=${new Date(timestamp).toDateString()}`;
    const response = await this.axiosService.get(url);
    if (response.status === 200) {
      const wfhResult = response.data;
      return wfhResult?.["result"] || [];
    }
    return [];
  }

  private async logTimeSheetForTask({ task, projectCode, emailAddress }: any) {
    const typeOfWork = task.type === "ot" ? 1 : 0;
    const hour = task.duration ? task.duration / 3600000 : 0;
    const taskName = task.name;
    const timesheetPayload = {
      note: task.note,
      emailAddress,
      projectCode,
      typeOfWork,
      taskName,
      hour,
    };
    const url =
      !hour || !projectCode
        ? `${process.env.TIMESHEET_API}MyTimesheets/CreateByKomu`
        : `${process.env.TIMESHEET_API}MyTimesheets/CreateFullByKomu`;
    const response = await this.axiosService.post(url, timesheetPayload, {
      headers: {
        "X-Secret-Key": process.env.DAILY_TO_TIMESHEET,
      },
    });
    return response;
  }

  private parseTimeSheetTask(chunk: string) {
    const [note, meta] = (chunk || "").split(";");
    const [timeRaw, type, name] = (meta || "").split(",");
    const time = normalizeString(timeRaw);
    const duration = parseDuration(time);
    return {
      note: normalizeString(note),
      time,
      duration,
      type: normalizeString(type),
      name: normalizeString(name),
    };
  }

  private parseTimeSheetSentence(sentence: string) {
    const chunks = sentence.split(new RegExp("\\+", "ig"));
    return chunks.filter((chunk) => chunk.trim()).map((chunk) => this.parseTimeSheetTask(chunk));
  }

  async getUserOffWork(date: Date = new Date()): Promise<{
    notSendUser: string[];
    userOffFullday: string[];
    userOffMorning: string[];
    userOffAfternoon: string[];
  }> {
    let userOffFullday: string[] = [];
    let userOffMorning: string[] = [];
    let userOffAfternoon: string[] = [];
    const url = date
      ? `${process.env.TIMESHEET_API}Public/GetAllUserLeaveDay?date=${date.toDateString()}`
      : `${process.env.TIMESHEET_API}Public/GetAllUserLeaveDay`;
    const response = await this.axiosService.get(url);
    if (response.data && response.data.result) {
      userOffFullday = response.data.result
        .filter((user: any) => user.message.includes("Off Fullday"))
        .map((item: any) => item.emailAddress.replace("@ncc.asia", ""));
      userOffMorning = response.data.result
        .filter((user: any) => user.message.includes("Off Morning"))
        .map((item: any) => item.emailAddress.replace("@ncc.asia", ""));
      userOffAfternoon = response.data.result
        .filter((user: any) => user.message.includes("Off Afternoon"))
        .map((item: any) => item.emailAddress.replace("@ncc.asia", ""));
    }
    const notSendUser =
      this.getStatusDay() === "Morning"
        ? [...userOffFullday, ...userOffMorning]
        : [...userOffFullday, ...userOffAfternoon];
    return { notSendUser, userOffFullday, userOffMorning, userOffAfternoon };
  }

  getStatusDay(): string {
    let statusDay: string;
    const date = new Date();
    const timezone = date.getTimezoneOffset() / -60;
    const hour = date.getHours();
    if (hour < 5 + timezone) {
      statusDay = "Morning";
    } else if (hour < 11 + timezone) {
      statusDay = "Afternoon";
    }
    return statusDay;
  }

  async getUserNotDaily(date: Date): Promise<{
    notDaily: string[];
    userNotDaily: string[];
    notDailyMorning: string[];
    notDailyFullday: string[];
    notDailyAfternoon: string[];
  }> {
    if (date && (date.getDay() === 0 || date.getDay() === 6 || date > new Date())) {
      return {
        notDaily: [],
        userNotDaily: [],
        notDailyMorning: [],
        notDailyFullday: [],
        notDailyAfternoon: [],
      };
    }
    return {
      notDaily: [],
      userNotDaily: [],
      notDailyMorning: [],
      notDailyFullday: [],
      notDailyAfternoon: [],
    };
  }

  async getUserWFH(args: any): Promise<{
    wfhUserEmail: string[];
    wfhUsers: any[];
  }> {
    let url: string;
    if (args[1]) {
      const format = formatDayMonth(args[1]);
      url = `${this.baseUrl}?date=${format}`;
    } else {
      url = this.baseUrl;
    }
    const wfhGetApi = await this.axiosService.get(url, {
      httpsAgent: this.httpsAgent,
      headers: {
        securitycode: this.wfhApiKeySecret,
      },
    });
    if (!wfhGetApi || wfhGetApi.data === undefined) {
      return;
    }
    const wfhUserEmail = wfhGetApi.data.result.map((item: any) => getUserNameByEmail(item.emailAddress));
    const wfhUsers = wfhGetApi.data.result;
    if ((Array.isArray(wfhUserEmail) && wfhUserEmail.length === 0) || !wfhUserEmail) {
      return;
    }
    return { wfhUserEmail, wfhUsers };
  }
}
