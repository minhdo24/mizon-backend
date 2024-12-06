import moment from "moment";
import { ApiMessageRef, ChannelMessage } from "mezon-sdk";

export function getPreviousWorkingDay(date: moment.Moment = moment()): moment.Moment {
  let previousDay = date.subtract(1, "day"); // Start with the day before the given date

  while (previousDay.isoWeekday() > 5) {
    previousDay = previousDay.subtract(1, "day");
  }

  return previousDay;
}

export function refGenerate(msg: ChannelMessage): Array<ApiMessageRef> {
  return [
    {
      message_id: "",
      message_ref_id: msg.message_id,
      ref_type: 0,
      message_sender_id: msg.sender_id,
      message_sender_username: msg.username,
      mesages_sender_avatar: msg.avatar,
      message_sender_clan_nick: msg.clan_nick,
      message_sender_display_name: msg.display_name,
      content: JSON.stringify(msg.content),
      has_attachment: !!msg?.attachments?.length || false,
    },
  ];
}
export function fieldGenerate(
  field: string,
  replayConent: any,
  message: ChannelMessage & { [key: string]: any },
  defaultValue: { [x: string]: any },
) {
  return field in replayConent ? replayConent[field] : field in defaultValue ? defaultValue[field] : message[field];
}

export function replyMessageGenerate(
  replayConent: { [x: string]: any },
  message: ChannelMessage,
  hasRef: boolean = true,
  newRef?: ApiMessageRef[],
): ReplyMezonMessage {
  const replayMessage: ReplyMezonMessage = {} as ReplyMezonMessage;
  const defaultValue: any = {
    mentions: [],
    attachments: [],
  };
  ["clan_id", "channel_id", "mode", "is_public", ...Object.keys(defaultValue)].forEach(
    (field) => (replayMessage[field] = fieldGenerate(field, replayConent, message, defaultValue)),
  );

  const messageContent: { [key: string]: any } = {
    t: "messageContent" in replayConent ? replayConent["messageContent"] : "",
  };

  // option for bot's message
  ["lk", "hg", "mk", "ej", "vk", "contentThread", "embed", "components"].forEach((key) => {
    if (key in replayConent) {
      messageContent[key] = replayConent[key];
    }
  });

  replayMessage["msg"] = { ...messageContent };

  replayMessage["ref"] = hasRef ? (newRef?.length ? newRef : refGenerate(message)) : [];

  return replayMessage;
}
