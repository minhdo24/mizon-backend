export interface ReactMessageChannel {
  id?: string;
  clan_id: string;
  parent_id?: string;
  channel_id: string;
  mode: number;
  is_public: boolean;
  is_parent_public: boolean;
  message_id: string;
  emoji_id: string;
  emoji: string;
  count: number;
  message_sender_id: string;
  action_delete?: boolean;
}
