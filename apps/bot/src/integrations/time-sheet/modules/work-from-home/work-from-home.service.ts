import { Injectable } from "@nestjs/common";

@Injectable()
export class WorkFromHomeService {
  constructor() {}

  async reportWfh(args: any, returnMsg = true): Promise<void> {
    // call api to get data
  }

  async reportMachleo(date: Date): Promise<void> {
    // call api to get data
  }
}
