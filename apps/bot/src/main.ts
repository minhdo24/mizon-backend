import * as dotenv from "dotenv";
dotenv.config();

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { Config } from "./config";
import { BotGateway } from "#src/integrations";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  });

  const configService = app.get<ConfigService<Config>>(ConfigService);

  // Setup swagger

  const swaggerConfig = new DocumentBuilder()
    .setTitle("mizon API")
    .setDescription("mizon API documents")
    .setVersion(configService.get("app.version", { infer: true }))
    .setExternalDoc("swagger.json", "/api-json")
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api", app, document);

  const port = configService.get("app.port", { infer: true });

  await app.listen(port);
  console.log(`Application is running on: ${port}`);
}
void bootstrap();
