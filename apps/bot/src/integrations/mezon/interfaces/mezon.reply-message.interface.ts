import { ApiMessageAttachment, ApiMessageMention, ApiMessageRef, ChannelMessageContent } from "mezon-sdk";
export interface ReplyMezonMessage {
  clan_id?: string;
  channel_id?: string;
  channelDmId?: string;
  is_public?: boolean;
  is_parent_public?: boolean;
  parent_id?: string;
  mode?: number;
  msg?: ChannelMessageContent;
  mentions?: Array<ApiMessageMention>;
  attachments?: Array<ApiMessageAttachment>;
  ref?: Array<ApiMessageRef>;
  userId?: string;
  textContent?: string;
  messOptions?: {
    [x: string]: any;
  };
  refs?: Array<ApiMessageRef>;
  sender_id?: string;
}
