import { io } from 'socket.io-client';

const SERVER_URL = 'http://0.0.0.0:3001';

const socket = io(SERVER_URL, {
  autoConnect: false,
});

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;
