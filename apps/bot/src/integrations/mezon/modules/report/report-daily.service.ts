import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosService } from "#src/integrations";

@Injectable()
export class ReportDailyService {
  private apiUrl: string;

  constructor(
    private readonly axiosService: AxiosService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get("timeSheet.WFHApi.apiURL");
  }

  private findCountNotDaily(arr: { email: string; count: number }[], email: string): number {
    const users = arr.find((item) => item.email === email);
    return users ? users.count : 1;
  }

  public getUserNotDaily(date: Date) {
    // call api get user not daily
    const result: { notDaily: any[] } = {
      notDaily: [],
    };
    return result;
  }

  public reportDaily(date: Date): void {
    // report daily
  }
}
