import { Injectable, Logger, forwardRef, Inject } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ClientService } from "#src/integrations";
import {
  ApiMessageReaction,
  ChannelMessage,
  TokenSentEvent,
  StreamingJoinedEvent,
  StreamingLeavedEvent,
  ChannelCreatedEvent,
  ChannelDeletedEvent,
  ChannelUpdatedEvent,
  UserChannelAddedEvent,
  UserChannelRemovedEvent,
  UserClanRemovedEvent,
  Events,
  MezonClient,
} from "mezon-sdk";
import { type WrapperType } from "#src/utils";

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);
  private client: MezonClient;

  constructor(
    @Inject(forwardRef(() => ClientService))
    private readonly clientService: WrapperType<ClientService>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.client = clientService.getClient();
  }

  initEvent() {
    for (const event in Events) {
      const eventValue =
        Events[event as keyof typeof Events] === "clan_event_created"
          ? Events[event as keyof typeof Events].replace(/_/g, "")
          : Events[event as keyof typeof Events].replace(/_event/g, "").replace(/_/g, "");
      this.logger.log(`Init event ${eventValue}`);
      const key = `handle${eventValue}`;
      if (key in this) {
        const handler = this[key as keyof BotGateway];
        this.logger.log(`Init event ${eventValue}`);
        this.client.on(Events[event as keyof typeof Events], handler, this);
      }
    }
  }

  async onApplicationBootstrap() {
    this.initEvent();
  }

  public handletokensent(data: TokenSentEvent) {
    this.eventEmitter.emit(Events.TokenSend, data);
  }

  public handlemessagebuttonclicked(data: any) {
    this.eventEmitter.emit(Events.MessageButtonClicked, data);
  }

  public handlestreamingjoined(data: StreamingJoinedEvent) {
    this.eventEmitter.emit(Events.StreamingJoinedEvent, data);
  }

  handlestreamingleaved = (data: StreamingLeavedEvent) => {
    this.eventEmitter.emit(Events.StreamingLeavedEvent, data);
  };

  handleclaneventcreated = (data: any) => {
    this.eventEmitter.emit(Events.ClanEventCreated, data);
  };

  handlemessagereaction = async (msg: ApiMessageReaction) => {
    this.eventEmitter.emit(Events.MessageReaction, msg);
  };

  handlechannelcreated = async (channel: ChannelCreatedEvent) => {
    this.eventEmitter.emit(Events.ChannelCreated, channel);
  };

  handleuserclanremoved(user: UserClanRemovedEvent) {
    this.eventEmitter.emit(Events.UserClanRemoved, user);
  }

  handlerole = (data: any) => {
    this.eventEmitter.emit(Events.RoleEvent, data);
  };

  handleroleassign = (data: any) => {
    this.eventEmitter.emit(Events.RoleAssign, data);
  };

  handleuserchanneladded = async (user: UserChannelAddedEvent) => {
    this.eventEmitter.emit(Events.UserChannelAdded, user);
  };

  handlechanneldeleted = async (channel: ChannelDeletedEvent) => {
    this.eventEmitter.emit(Events.ChannelDeleted, channel);
  };

  handlechannelupdated = async (channel: ChannelUpdatedEvent) => {
    this.eventEmitter.emit(Events.ChannelUpdated, channel);
  };

  handleuserchannelremoved = async (msg: UserChannelRemovedEvent) => {
    this.eventEmitter.emit(Events.UserChannelRemoved, msg);
  };

  handlegivecoffee = async (data: any) => {
    this.eventEmitter.emit(Events.GiveCoffee, data);
  };

  handleaddclanuser = async (data: any) => {
    this.eventEmitter.emit(Events.AddClanUser, data);
  };

  handleroleassigned = async (msg: any) => {
    console.log(msg);
  };

  public async handlechannelmessage(msg: ChannelMessage) {
    console.log("handlechannelmessage", msg);
    if (msg.code) return; // ignored edited message
    (["attachments", "mentions", "references"] as (keyof ChannelMessage)[]).forEach((key) => {
      if (!Array.isArray(msg[key])) (msg[key] as unknown) = [];
    });
    this.eventEmitter.emit(Events.ChannelMessage, msg);
  }
}
