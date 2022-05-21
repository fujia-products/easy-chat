import { io, Socket } from 'socket.io-client';

const SERVER_URL = 'http://0.0.0.0:3001';

interface CSocket extends Socket {
  userID?: string;
}

const socket = io(SERVER_URL, {
  autoConnect: false,
}) as CSocket;

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;
