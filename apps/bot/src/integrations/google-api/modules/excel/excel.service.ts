import { Logger, forwardRef, Inject } from "@nestjs/common";
import { Moment } from "moment";
import { ConfigService } from "@nestjs/config";
import { Config } from "#src/config";
import { GoogleApiService } from "../../google-api.service";
import { type WrapperType, getPreviousWorkingDay } from "#src/utils";
import { ReportDailyService, WorkFromHomeService, TrackerService } from "#src/integrations";
import moment from "moment";

export type ReportType = "daily" | "komu" | "tracker" | "office";

export class ExcelService {
  private sheetId = this.configService.getOrThrow("sheet.sheetFineId", { infer: true });
  private readonly logger = new Logger(ExcelService.name);
  private readonly sheets = this.googleApiService.getSheets();

  constructor(
    private readonly configService: ConfigService<Config>,
    @Inject(forwardRef(() => GoogleApiService))
    private readonly googleApiService: WrapperType<GoogleApiService>,

    @Inject(forwardRef(() => ReportDailyService))
    private readonly reportDailyService: WrapperType<ReportDailyService>,

    @Inject(forwardRef(() => WorkFromHomeService))
    private readonly workFromHomeService: WrapperType<WorkFromHomeService>,

    @Inject(forwardRef(() => TrackerService))
    private readonly trackerService: WrapperType<TrackerService>,
  ) {}

  private getSheetName(reportDate: Moment): string {
    const month = reportDate.month();

    let monday = reportDate.clone().startOf("week").add(1, "day");
    let friday = reportDate.clone().endOf("week").add(-1, "day");

    while (monday.month() < month) {
      monday = monday.add(1, "day");
    }

    while (friday.month() > month) {
      friday = friday.add(-1, "day");
    }

    return `${monday.format("DD")}-${friday.format("DD/MM")}`;
  }

  private handleDailyFine(daily: any, cellValue: Map<string, number>, reportDate: Moment, sheetValues: any[][]) {
    for (const item of daily) {
      this.updateCellValue(cellValue, item.email, "daily", reportDate, Number(item.count) * 20, sheetValues);
    }
  }

  private handleMentionFine(mention: any, cellValues: Map<string, number>, reportDate: Moment, sheetValues: any[][]) {
    for (const item of mention) {
      this.updateCellValue(cellValues, item.email, "komu", reportDate, Number(item.count) * 20, sheetValues);
    }
  }

  private handleWFHFine(wfh: any, cellValues: Map<string, number>, reportDate: Moment, sheetValues: any[][]) {
    for (const item of wfh) {
      this.updateCellValue(cellValues, item.username, "komu", reportDate, Number(item.total) * 20, sheetValues);
    }
  }

  private handleTrackerFine(tracker: any, cellValues: Map<string, number>, reportDate: Moment, sheetValues: any[][]) {
    //Fortna team
    const ignoredEmail = [
      "ha.nguyen",
      "hiep.ngoxuan",
      "diem.buithi",
      "linh.vutai",
      "hoang.nguyenanh",
      "phuong.dangdanh",
      "phuc.duong",
      "ha.nguyenthi",
      "hang.buithidiem",
      "thai.buiminh",
      "trang.tranthu",
    ];

    const secondsMorning = 4 * 3600 * 0.85;
    const secondsAfternoon = 4 * 3600 * 0.85;
    const secondsAllDay = 8 * 3600 * 0.85;

    for (const item of tracker) {
      let requireTime = secondsAllDay;

      const {
        email,
        str_active_time,
        offWork,
      }: {
        email: string;
        str_active_time: string;
        offWork: string;
      } = item;

      if (ignoredEmail.includes(email.toLowerCase().trim())) {
        continue;
      }

      if (offWork) {
        if (offWork.toLowerCase().includes("morning")) {
          requireTime = requireTime - secondsMorning;
        } else if (offWork.toLowerCase().includes("afternoon")) {
          requireTime = requireTime - secondsAfternoon;
        }

        if (offWork.includes(":")) {
          let timeOffSeconds = 0;
          const timeOff = offWork.split(":").slice(1)[0]?.trim()?.replace("h", "");

          if (!isNaN(parseFloat(timeOff))) {
            timeOffSeconds = Math.round(parseFloat(timeOff) * 3600 * 0.85);
          }

          requireTime = requireTime - timeOffSeconds;
        }
      }

      const regex = /(\d+)h(\d+)m(\d+)s/;
      const match = str_active_time.match(regex);
      const totalTime = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]);

      const missingTime = requireTime - totalTime;

      let fine = 0;

      if (missingTime >= 5 * 3600) {
        fine = 200;
      } else if (missingTime >= 3 * 3600) {
        fine = 100;
      } else if (missingTime >= 1 * 3600) {
        fine = 50;
      } else if (missingTime > 0) {
        fine = 20;
      }

      if (fine > 0) {
        this.updateCellValue(cellValues, email, "tracker", reportDate, fine, sheetValues);
      }
    }
  }

  private getColumnIndex = (targetValue: string, reportDate: Moment, sheetValues: any[][]) => {
    const headerValue = reportDate.format("DD.MM");
    const headers = sheetValues[0];
    const headerIndex = headers.indexOf(headerValue);
    if (headerIndex === -1) return null;

    const belowHeaders = sheetValues[1];

    for (let i = headerIndex; i < headerIndex + 4; i++) {
      if (belowHeaders[i] === targetValue) {
        return i;
      }
    }

    return null;
  };

  private getRowIndex = (targetValue: string, sheetValues: any[][]) => {
    const rowValues = sheetValues.map((x) => x[4]); //column 4 is email

    for (let i = 0; i < rowValues.length; i++) {
      if (rowValues[i]?.toLowerCase()?.trim() === targetValue) {
        return i;
      }
    }

    return null;
  };

  private getA1Notation = (rowIndex: number, colIndex: number) => {
    let columnLetter = "";
    while (colIndex > 0) {
      const remainder = (colIndex - 1) % 26;
      columnLetter = String.fromCharCode(65 + remainder) + columnLetter;
      colIndex = Math.floor((colIndex - 1) / 26);
    }
    return `${columnLetter}${rowIndex}`;
  };

  private getSheetValues = async (reportDate: Moment) => {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.sheetId,
      range: this.getSheetName(reportDate),
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      this.logger.warn("No data found in the sheet.");
      return;
    }
    return rows;
  };

  private updateCellValue(
    cellValue: Map<string, number>,
    email: string,
    reportType: ReportType,
    reportDate: Moment,
    value: number,
    sheetValues: any[][],
  ): void {
    const rowIndex = this.getRowIndex(`${email.toLowerCase().trim()}@ncc.asia`, sheetValues);
    const colIndex = this.getColumnIndex(reportType.toString().toUpperCase(), reportDate, sheetValues);
    if (!rowIndex || !colIndex) {
      return;
    }
    const cellAddress = this.getA1Notation(rowIndex + 1, colIndex + 1);
    cellValue.set(cellAddress, (cellValue.get(cellAddress) || 0) + value);
  }

  private async saveChange(reportDate: Moment, cellValue: Map<string, number>) {
    const sheetName = this.getSheetName(reportDate);
    const data = Array.from(cellValue.keys()).map((key: string) => {
      return {
        range: `${sheetName}!${key}`,
        values: [[cellValue.get(key)]],
      };
    });

    return this.sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: this.sheetId,
      requestBody: {
        valueInputOption: "RAW",
        data,
      },
    });
  }

  public async reportSheet(reportDate?: moment.Moment, sheetId?: string) {
    try {
      const now = moment();

      if (!reportDate) {
        reportDate = getPreviousWorkingDay(now);
      }

      if (!sheetId) {
        sheetId = this.sheetId;
      }

      const parsedDate = reportDate.startOf("day").toDate();
      const formatedDate = reportDate.format("DD/MM/YYYY");

      const [daily, mention, wfh, tracker] = await Promise.all([
        this.reportDailyService.getUserNotDaily(parsedDate),
        this.workFromHomeService.reportMachleo(parsedDate),
        // eslint-disable-next-line no-sparse-arrays
        this.workFromHomeService.reportWfh([, formatedDate], false),
        // eslint-disable-next-line no-sparse-arrays
        this.trackerService.reportTrackerNot([, formatedDate], false),
      ]);

      const notDaily = daily?.notDaily;

      const sheetValues = await this.getSheetValues(reportDate);
      const cellValue = new Map<string, number>();

      this.handleDailyFine(notDaily, cellValue, reportDate, sheetValues);

      this.handleMentionFine(mention, cellValue, reportDate, sheetValues);

      this.handleWFHFine(wfh, cellValue, reportDate, sheetValues);

      this.handleTrackerFine(tracker, cellValue, reportDate, sheetValues);

      await this.saveChange(reportDate, cellValue);

      return {
        reportDate,
        sheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}`,
      };
    } catch (error) {
      this.logger.error("reportSheet_error", error);
      throw error;
    }
  }
}
