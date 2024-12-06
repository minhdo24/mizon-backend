import { ConfigService } from "@nestjs/config";
import "dotenv/config";
import { DataSource } from "typeorm";

const configService = new ConfigService();

export default new DataSource({
  type: "postgres",
  host: configService.get("DB_HOST"),
  port: +configService.get("DB_PORT"),
  database: configService.get("DB_NAME"),
  username: configService.get("DB_USERNAME"),
  password: configService.get("DB_PASSWORD"),
  ssl: configService.get("DB_SSL") === "true" && { rejectUnauthorized: false },
  entities: ["src/**/*.entity.ts"],
  migrations: ["database/migrations/*.ts"],
});
