import { Injectable, Logger, Inject, forwardRef, OnApplicationBootstrap } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { MezonClientService } from "#src/integrations";
import { WrapperType } from "#src/utils";
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
  Events
} from "mezon-sdk";

@Injectable()
export class BotGateway implements OnApplicationBootstrap {
  private readonly logger = new Logger(BotGateway.name);
  private client;

  constructor(
    @Inject(forwardRef(() => MezonClientService)) private readonly clientService: WrapperType<MezonClientService>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.client = clientService.getClient();
  }

    initEvent() {
        for (const event of Object.keys(Events) as Array<keyof typeof Events>) {
          const eventValue =
            Events[event] === 'clan_event_created'
              ? Events[event].replace(/_/g, '')
              : Events[event].replace(/_event/g, '').replace(/_/g, '');
          this.logger.log(`Init event ${eventValue}`);
          const key = `handle${eventValue}`;
          if (key in this) {
            this.client.on(Events[event], this[key], this);
          }
        }
      }


   onApplicationBootstrap() {
    this.initEvent();
  }

  handletokensent = (data: TokenSentEvent) => {
    this.eventEmitter.emit(Events.TokenSend, data);
  };

  handlemessagebuttonclicked = (data: any) => {
    this.eventEmitter.emit(Events.MessageButtonClicked, data);
  };

  handlestreamingjoined = (data: StreamingJoinedEvent) => {
    this.eventEmitter.emit(Events.StreamingJoinedEvent, data);
  };

  handlestreamingleaved = (data: StreamingLeavedEvent) => {
    this.eventEmitter.emit(Events.StreamingLeavedEvent, data);
  };

  handleclaneventcreated = (data) => {
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

  handlerole = (data) => {
    this.eventEmitter.emit(Events.RoleEvent, data);
  };

  handleroleassign = (data) => {
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

  handlegivecoffee = async (data) => {
    this.eventEmitter.emit(Events.GiveCoffee, data);
  };

  handleaddclanuser = async (data) => {
    this.eventEmitter.emit(Events.AddClanUser, data);
  };

  handleroleassigned = async (msg) => {
    console.log(msg);
  };

  handlechannelmessage = async (msg: ChannelMessage) => {
    if (msg.code) return; // ignored edited message
    ['attachments', 'mentions', 'references'].forEach((key) => {
      if (!Array.isArray(msg[key])) msg[key] = [];
    });
    try {
      if (msg.sender_id && msg.sender_id !== '0') {
        await this.extendersService.addDBUser(msg);
      }
    } catch (e) {
      console.log(e);
    }
    const webhook = await this.userRepository.find({
      where: { roles: IsNull(), user_type: EUserType.MEZON },
    });
    const webhookId = webhook.map((item) => item.userId);
    // if (webhookId.includes(msg.sender_id)) return;
    this.eventEmitter.emit(Events.ChannelMessage, msg);
  };
}

  handleuserclanremoved(user: UserClanRemovedEvent) {
    this.eventEmitter.emit("UserClanRemoved", user);
  }
}
