/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosService } from "#src/integrations";
import { TimeSheetService } from "#src/integrations";
import * as https from "https";

@Injectable()
export class TrackerService {
  private baseUrl = this.configService.getOrThrow("tracker.baseUrl", { infer: true });
  private komuTrackerApiKey = this.configService.getOrThrow("tracker.komutrackerApiKeySecret", {
    infer: true,
  });

  private messHelpTime: string;

  constructor(
    private readonly axiosService: AxiosService,
    private readonly timeSheetService: TimeSheetService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.getOrThrow("tracker.baseUrl", { infer: true });
  }

  async reportTracker(args: string[], returnMsg = true): Promise<string[]> {}

  private processUserWfhs(data: any[], wfhUsers: any[], usersOffWork: any[]) {
    const userWfhs = [];
    for (const user of data) {
      const matchingWfhUser = wfhUsers.find((wfhUser) => wfhUser.emailAddress === user.email.concat("@ncc.asia"));
      if (matchingWfhUser) {
        user.dateTypeName = matchingWfhUser.dateTypeName;
        userWfhs.push(user);
        const matchingOffWorkUser = usersOffWork.find(
          (offWorkUser) => offWorkUser.emailAddress === user.email.concat("@ncc.asia"),
        );
        user.offWork = matchingOffWorkUser?.message?.replace(/\[.*?\]\s*Off\s+/, "").trim() || "";
      }
    }
    return userWfhs;
  }

  private async getUserOffWork(args: string[]) {}

  private splitMessage(message: string, maxLength: number) {}

  async reportTrackerNot(args, returnMsg = true) {}

  prependMessage(array: string[], message: string) {
    array.unshift(message);
    if (array.length === 1) {
      array.push("(Không ai vi phạm)");
    }
  }

  getFriday() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = (dayOfWeek - 5 + 7) % 7;
    const friday = new Date(now);
    friday.setDate(now.getDate() - diff);
    const utcPlus7 = new Date(friday.getTime() + 7 * 60 * 60 * 1000);
    return utcPlus7.getTime();
  }
}
