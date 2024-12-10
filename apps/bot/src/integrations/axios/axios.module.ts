import { Module } from "@nestjs/common";
import { AxiosService } from "./axios.service";

@Module({
  imports: [],
  providers: [AxiosService],
  exports: [AxiosService],
})
export class AxiosModule {}
