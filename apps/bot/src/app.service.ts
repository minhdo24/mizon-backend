import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  public constructor() {}

  public getInformation() {
    return "Hello, World!";
  }
}
