interface IMessageStore {
  saveMessage(message: PrivateMessage): void;
  findMessagesForUser(userID: string): PrivateMessage[];
}

interface PrivateMessage {
  content: string;
  from?: string;
  to?: string;
}

export class InMemoryMessageStore implements IMessageStore {
  constructor(public messages: PrivateMessage[] = []) {}

  saveMessage(message: PrivateMessage) {
    this.messages.push(message);
  }

  findMessagesForUser(userID: string): PrivateMessage[] {
    return this.messages.filter(
      ({ from, to }) => from === userID || to === userID
    );
  }
}
