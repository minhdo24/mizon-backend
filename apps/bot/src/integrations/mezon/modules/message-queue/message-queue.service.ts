import { ReplyMezonMessage } from "#src/integrations";

export class MessageQueueService {
  private queue: ReplyMezonMessage[] = [];

  getMessageQueue(): ReplyMezonMessage[] {
    return this.queue;
  }

  addMessage(message: ReplyMezonMessage): void {
    this.queue.push(message);
  }

  getNextMessage(): ReplyMezonMessage | undefined {
    return this.queue.shift();
  }

  hasMessages(): boolean {
    return this.queue.length > 0;
  }
}
