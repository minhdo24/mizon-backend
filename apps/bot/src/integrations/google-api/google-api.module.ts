"use strict";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GoogleApiService } from "./google-api.service";

@Module({
  imports: [ConfigModule],
  providers: [GoogleApiService],
  exports: [GoogleApiService],
})
export class GoogleApiModule {}
