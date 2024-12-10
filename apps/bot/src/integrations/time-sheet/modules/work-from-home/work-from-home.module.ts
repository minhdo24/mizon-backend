import { Module } from "@nestjs/common";
import { WorkFromHomeService } from "./work-from-home.service";

@Module({
  imports: [],
  providers: [WorkFromHomeService],
  exports: [WorkFromHomeService],
})
export class WorkFromHomeModule {}
