import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { google, sheets_v4 } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { Config } from "#src/config";

@Injectable()
export class GoogleApiService {
  private readonly logger = new Logger(GoogleApiService.name);

  private readonly sheetClientId = this.configService.getOrThrow("sheet.sheetClientId", { infer: true });

  private readonly sheetClientSecret = this.configService.getOrThrow("sheet.sheetClientSecret", { infer: true });

  private readonly sheetRedirectURI = this.configService.getOrThrow("sheet.sheetRedirectURI", { infer: true });

  private readonly sheetRefreshToken = this.configService.getOrThrow("sheet.sheetRefreshToken", { infer: true });

  private readonly sheetFineId = this.configService.getOrThrow("sheet.sheetFineId", { infer: true });

  private readonly client: OAuth2Client;

  private readonly sheets: sheets_v4.Sheets;

  constructor(private readonly configService: ConfigService<Config>) {
    this.client = new OAuth2Client({
      clientId: this.sheetClientId,
      clientSecret: this.sheetClientSecret,
    });

    this.client.setCredentials({
      refresh_token: this.sheetRefreshToken,
    });

    this.sheets = google.sheets({
      version: "v4",
      auth: this.client,
    } as unknown as sheets_v4.Options);
  }

  public getSheets() {
    return this.sheets;
  }
}
