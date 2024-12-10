import { Module } from "@nestjs/common";
import { RoleService } from "./role.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RoleMezon } from "./entities";

@Module({
  imports: [TypeOrmModule.forFeature([RoleMezon])],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
