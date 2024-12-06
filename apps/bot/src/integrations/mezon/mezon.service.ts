"use strict";
import { ConfigService } from "@nestjs/config";
import { Injectable, Logger } from "@nestjs/common";
import { MezonClient } from "mezon-sdk";
import { MESSAGE_MODE } from "#src/integrations";

@Injectable()
export class MezonClientService {
  private logger = new Logger(MezonClientService.name);
  private token: string;
  private client: MezonClient;

  constructor(private configService: ConfigService) {
    this.token = this.configService.getOrThrow("mezon.token", { infer: true });
    this.client = new MezonClient(this.token);
  }

  async initializeClient(): Promise<void> {
    try {
      const result = await this.client.authenticate();
      this.logger.log("authenticated.", result);
    } catch (error) {
      this.logger.error("error authenticating.", error);
      throw error;
    }
  }

  getClient(): MezonClient {
    return this.client;
  }

  async sendMessage(replyMessage: ReplyMezonMessage) {
    return this.client.sendMessage(
      replyMessage.clan_id,
      replyMessage.channel_id,
      replyMessage.mode,
      replyMessage.is_public,
      replyMessage.msg,
      replyMessage.mentions,
      replyMessage.attachments,
      replyMessage.ref,
    );
  }

  async sendMessageToUser(messageToUser: ReplyMezonMessage) {
    return this.client.sendDMChannelMessage(
      messageToUser.channelDmId,
      messageToUser.textContent ?? "",
      messageToUser.messOptions ?? {},
      messageToUser.attachments ?? [],
      messageToUser.refs ?? [],
    );
  }

  async createDMchannel(userId: string) {
    return this.client.createDMchannel(userId);
  }

  async reactMessageChannel(dataReact: ReactMessageChannel) {
    return this.client.reactionMessage(
      "",
      dataReact.clan_id,
      dataReact.channel_id,
      MESSAGE_MODE.CHANNEL_MESSAGE,
      dataReact.is_public,
      dataReact.message_id,
      dataReact.emoji_id,
      dataReact.emoji,
      dataReact.count,
      dataReact.message_sender_id,
      false,
    );
  }
}
