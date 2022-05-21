interface ISessionStore {
  findSession: (id: string) => any;

  saveSession: (id: string, session: any) => void;

  findAllSession: () => any[];
}

export class InMemorySessionStore implements ISessionStore {
  sessions: Map<any, any>;
  constructor() {
    this.sessions = new Map();
  }

  findSession(id: string) {
    return this.sessions.get(id);
  }

  saveSession(id?: string, session?: any): void {
    this.sessions.set(id, session);
  }

  findAllSession(): any[] {
    return [...this.sessions.values()];
  }
}
