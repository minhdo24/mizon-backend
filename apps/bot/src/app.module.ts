import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { resolve } from "node:path";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import * as allConfigs from "./config";
import { RoleMezonModule } from "./modules";
import { AxiosModule, MezonModule, TimeSheetModule, TrackerModule, WorkFromHomeModule } from "#src/integrations";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [resolve(__dirname, "..", ".env"), resolve(__dirname, "..", ".env.example")],
      load: Object.values(allConfigs),
      expandVariables: true,
      cache: true,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.getOrThrow("database.host", { infer: true }),
        port: config.getOrThrow("database.port", { infer: true }),
        database: config.getOrThrow("database.database", { infer: true }),
        username: config.getOrThrow("database.username", { infer: true }),
        password: config.getOrThrow("database.password", { infer: true }),
        ssl: config.get("database.ssl", { infer: true }) && {
          rejectUnauthorized: false,
        },
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    AxiosModule,
    RoleMezonModule,
    MezonModule,
    TimeSheetModule,
    TrackerModule,
    WorkFromHomeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
