import { Injectable, Logger } from "@nestjs/common";
import { CrudService } from "#src/utils";
import { RoleMezon } from "./entities";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class RoleService extends CrudService<RoleMezon> {
  private readonly logger = new Logger(RoleService.name);

  public constructor(@InjectRepository(RoleMezon) protected readonly repo: Repository<RoleMezon>) {
    super(repo);
  }
}
