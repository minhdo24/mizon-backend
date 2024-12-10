import { Controller, Get, Ip, Logger, Headers } from "@nestjs/common";
import { type IncomingHttpHeaders } from "node:http";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AppService } from "./app.service";

@ApiTags("common")
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  public constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: "Get API information" })
  @Get()
  public getInfo(@Ip() ip: string, @Headers() headers: IncomingHttpHeaders): string {
    this.logger.log({ log: "Client headers", ip, headers });

    return this.appService.getInformation();
  }
}
