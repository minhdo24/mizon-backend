import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { StorageModule } from "#src/integrations";
import { Asterisk } from "./asterisk-commands.service";
import { ReportCommandModule } from "./commands";

@Module({
  imports: [ConfigModule, StorageModule, ReportCommandModule],
  providers: [Asterisk],
  exports: [Asterisk],
})
export class AsteriskCommandModule {}