import { registerAs } from "@nestjs/config";
import { env } from "process";

export interface MezonConfig {
  token: string;
  komubotrestClanNccId: string;
  mezonNhacuachungChannelId: string;
}

export const mezonConfig = registerAs<MezonConfig>("mezon", () => ({
  token: env.MEZON_TOKEN,
  komubotrestClanNccId: env.KOMUBOTREST_CLAN_NCC_ID,
  mezonNhacuachungChannelId: env.MEZON_NHACUACHUNG_CHANNEL_ID,
}));
