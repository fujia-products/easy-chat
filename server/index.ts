import http from 'http';
import { Server, Socket } from 'socket.io';

interface MySocket extends Socket {
  username?: string;
}

const PORT = process.env.PORT || 3001;

const httpServer = http.createServer();

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:8081',
  },
});

io.use((socket: MySocket, next) => {
  const username = socket.handshake.auth.username;

  if (!username) {
    return next(new Error('invalid username'));
  }

  socket.username = username;
  next();
});

io.on('connection', (socket: MySocket) => {
  const users = [];

  for (const [id, socket] of io.of('/').sockets) {
    users.push({
      userID: id,
      username: (<MySocket>socket).username,
    });
  }

  socket.emit('users', users);

  // notify existing users
  socket.broadcast.emit('userConnected', {
    userID: socket.id,
    username: socket.username,
  });

  // forward the private message to the right recipient
  socket.on('privateMessage', ({ content, to }) => {
    socket.to(to).emit('privateMessage', {
      content,
      from: socket.id,
    });
  });

  // notify users upon disconnection
  socket.on('disconnect', () => {
    socket.broadcast.emit('userDisconnected', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`The service is running on: http://0.0.0.0:${PORT}`);
});
