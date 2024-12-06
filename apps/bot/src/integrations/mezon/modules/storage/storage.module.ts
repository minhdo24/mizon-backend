import { Module } from "@nestjs/common";
import { CommandStorage } from "./storage.service";

@Module({
  imports: [],
  providers: [CommandStorage],
  exports: [CommandStorage],
})
export class StorageModule {}
