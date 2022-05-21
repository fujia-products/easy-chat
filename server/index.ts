import http from 'http';
import { Server, Socket } from 'socket.io';
import crypto from 'crypto';

import { InMemorySessionStore } from './sessionStore';
import { InMemoryMessageStore } from './messageStore';

interface MySocket extends Socket {
  username?: string;
  sessionID?: string;
  userID?: string;
}

interface IUser {
  username?: string;
  userID?: string;
  connected?: boolean;
  messages?: any[];
}

const PORT = process.env.PORT || 3001;
const randomId = () => crypto.randomBytes(8).toString('hex');
const sessionStore = new InMemorySessionStore();
const messageStore = new InMemoryMessageStore();

const httpServer = http.createServer();

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:8081',
  },
});

io.use((socket: MySocket, next) => {
  const sessionID = socket.handshake.auth.sessionID;

  if (sessionID) {
    const session = sessionStore.findSession(sessionID);

    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.username = session.username;

      return next();
    }
  }

  const username = socket.handshake.auth.username;

  if (!username) {
    return next(new Error('invalid username'));
  }

  socket.username = username;
  socket.sessionID = randomId();
  socket.userID = randomId();

  next();
});

io.on('connection', (socket: MySocket) => {
  if (!socket.userID) return;

  // persist session
  sessionStore.saveSession(socket.sessionID, {
    userID: socket.userID,
    username: socket.username,
    connected: true,
  });

  // emit session details
  socket.emit('session', {
    sessionID: socket.sessionID,
    userID: socket.userID,
  });

  // join the "userID" room
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  socket.join(socket.userID!);

  // fetch existing users
  const users: IUser[] = [];
  const messagesPerUser = new Map();

  messageStore.findMessagesForUser(socket.userID).forEach((message) => {
    const { from, to } = message;

    const otherUser = socket.userID === from ? to : from;

    if (messagesPerUser.has(otherUser)) {
      messagesPerUser.get(otherUser).push(message);
    } else {
      messagesPerUser.set(otherUser, [message]);
    }
  });

  sessionStore.findAllSession().forEach((session) => {
    users.push({
      userID: session.userID,
      username: session.username,
      connected: session.connected,
      messages: messagesPerUser.get(session.userID) || [],
    });
  });

  socket.emit('users', users);

  // notify existing users
  // socket.broadcast.emit('userConnected', {
  //   userID: socket.id,
  //   username: socket.username,
  // });

  socket.broadcast.emit('userConnected', {
    userID: socket.userID,
    username: socket.username,
    connected: true,
    messages: [],
  });

  // forward the private message to the right recipient (and to other tabs of the sender)
  // socket.on('privateMessage', ({ content, to }) => {
  //   socket.to(to).emit('privateMessage', {
  //     content,
  //     from: socket.id,
  //   });
  // });

  socket.on('privateMessage', ({ content, to }) => {
    const message = {
      content,
      from: socket.userID,
      to,
    };
    socket.to(to).to(socket.userID!).emit('privateMessage', message);
    messageStore.saveMessage(message);
  });

  // notify users upon disconnection
  // socket.on('disconnect', () => {
  //   socket.broadcast.emit('userDisconnected', socket.id);
  // });

  socket.on('disconnect', async () => {
    const matchingSockets = await io.in(socket.userID!).allSockets();
    const isDisconnected = matchingSockets.size === 0;

    if (isDisconnected) {
      // notify other users
      socket.broadcast.emit('userDisconnected', socket.userID);

      // update the connection status of the session
      sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        username: socket.username,
        connected: false,
      });
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`The service is running on: http://0.0.0.0:${PORT}`);
});
